require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { Parser } = require('json2csv');
const tools = require('./tools')

const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(bodyParser.json());

// In-memory storage for chat sessions
const chatSessions = {};

const dbFile = './corpcode.db';
const dbExists = fs.existsSync(dbFile);

// Initialize SQLite database
const db = new sqlite3.Database(dbFile);

if (!dbExists) {
  // Create table and load data
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS corps (corp_code TEXT PRIMARY KEY, corp_name TEXT, stock_code TEXT, modify_date TEXT)");

    const stmt = db.prepare("INSERT OR REPLACE INTO corps (corp_code, corp_name, stock_code, modify_date) VALUES (?, ?, ?, ?)");
    
    const corpData = JSON.parse(fs.readFileSync('./corpcode.json', 'utf8'));
    corpData.forEach(corp => {
      stmt.run(corp.corp_code, corp.corp_name, corp.stock_code, corp.modify_date);
    });
    
    stmt.finalize();
  });
}

// API endpoint
async function actionGetCorpCode({ corpName }) {
  console.log("Received corpName:", corpName); // Debugging line
  return new Promise((resolve, reject) => {
    db.get("SELECT corp_code FROM corps WHERE corp_name = ?", [corpName], (err, row) => {
      if (err) {
        console.error("Database error:", err); // Debugging line
        reject('Database error');
      } else if (row) {
        console.log("Database row found:", row); // Debugging line
        resolve(row.corp_code);
      } else {
        console.log("Corporation not found for corpName:", corpName); // Debugging line
        resolve('Corporation not found');
      }
    });
  });
};

async function getSingleCompanyKeyFinancials({ corp_code, bsns_year, reprt_code, fs_div }) {
  const apiKey = process.env.CRTFC_API_KEY;
  const url = `https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json?crtfc_key=${apiKey}&corp_code=${corp_code}&bsns_year=${bsns_year}&reprt_code=${reprt_code}&fs_div=${fs_div}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== "000") {
      throw new Error(`API error! message: ${data.message}`);
    }

    const fields = [
      'rcept_no', 'reprt_code', 'bsns_year', 'corp_code', 'sj_div', 'sj_nm', 
      'account_id', 'account_nm', 'account_detail', 'thstrm_nm', 
      'thstrm_amount', 'frmtrm_nm', 'frmtrm_amount', 'bfefrmtrm_nm', 
      'bfefrmtrm_amount', 'ord', 'currency'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data.list);

    return JSON.stringify(csv).replace(/\"/g, '')
  } catch (error) {
    // console.error("Error fetching financial statement:", error);
    return "Error fetching financial statement"
  }
}
async function getCompanyIndex({ corp_code, bsns_year, reprt_code, idx_cl_code }) {
  const apiKey = process.env.CRTFC_API_KEY;
  const url = `https://opendart.fss.or.kr/api/fnlttCmpnyIndx.json?crtfc_key=${apiKey}&corp_code=${corp_code}&bsns_year=${bsns_year}&reprt_code=${reprt_code}&idx_cl_code=${idx_cl_code}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== "000") {
      throw new Error(`API error! message: ${data.message}`);
    }

    const fields = [
      'bsns_year', 'corp_code', 'stock_code', 'reprt_code', 'idx_cl_code', 
      'idx_cl_nm', 'idx_code', 'idx_nm', 'idx_val'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data.list);

    return JSON.stringify(csv).replace(/\"/g, '')
  } catch (error) {
    console.error("Error fetching company index:", error);
    return "Error fetching company index";
  }
}

async function getMultiAccount({ corp_code, bsns_year, reprt_code }) {
  const apiKey = process.env.CRTFC_API_KEY;
  const url = `https://opendart.fss.or.kr/api/fnlttMultiAcnt.json?crtfc_key=${apiKey}&corp_code=${corp_code}&bsns_year=${bsns_year}&reprt_code=${reprt_code}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== "000") {
      throw new Error(`API error! message: ${data.message}`);
    }

    const fields = [
      // 'rcept_no', 'bsns_year', 'stock_code', 'reprt_code', 
      'account_nm', 
      'fs_div', 'fs_nm', 'sj_div', 'sj_nm', 'thstrm_nm', 'thstrm_dt', 
      'thstrm_amount', 'thstrm_add_amount', 'frmtrm_nm', 'frmtrm_dt', 
      'frmtrm_amount', 'frmtrm_add_amount', 'bfefrmtrm_nm', 'bfefrmtrm_dt', 
      'bfefrmtrm_amount', 'ord', 'currency'
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data.list);

    return JSON.stringify(csv).replace(/\\\"/g, '')
  } catch (error) {
    console.error("Error fetching multi account:", error);
    return "Error fetching multi account";
  }
}

app.post('/chat/:clientId', async (req, res) => {
  const clientId = req.params.clientId;
  const model = req.body.model;
  const userMessage = req.body.message;
  const clientApiKey = req.body.apiKey; // New: Get API key from request

  if (!clientApiKey) {
    return res.status(400).json({ error: 'OpenAI API key is required' });
  }

  // Initialize OpenAI with the client's API key
  const openai = new OpenAI({
    apiKey: clientApiKey,
  });

  console.log(model)

  if (!chatSessions[clientId]) {
    chatSessions[clientId] = [{ role: "system", content: `
    You are a financial analyst tasked with predicting the direction of future earnings for a company based solely on its financial statements. Follow the steps below to conduct your analysis:

    1. Identify notable changes in key financial statement items.
    2. Compute the following financial ratios:
       - Operating Margin
       - Current Ratio
       - Asset Turnover
       - Debt-to-Equity Ratio
    
    Provide the formulas and calculations for each ratio.
    
    3. Interpret the calculated ratios and provide insights into the company's operating efficiency, liquidity, leverage, and overall financial health.
    
    4. Synthesize the information and predict whether the company's earnings will increase or decrease in the next period. Provide a detailed explanation and rationale for your prediction, highlighting the key factors influencing your decision.
    Answer in Korean!
    `}];
  }

  chatSessions[clientId].push({ role: 'user', content: userMessage });

  let continueConversation = true;
  while (continueConversation) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages: chatSessions[clientId],
        tools,
        tool_choice: "auto",
      });
      const responseMessage = response.choices[0].message;

      console.log(responseMessage)

      const toolCalls = responseMessage.tool_calls;
      if (toolCalls) {
        const availableFunctions = {
          action_get_corp_code: actionGetCorpCode,
          action_get_single_company_key_financials: getSingleCompanyKeyFinancials,
          action_get_company_index: getCompanyIndex,
          action_get_multi_account: getMultiAccount,
        };
        chatSessions[clientId].push(responseMessage);
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name;
          const functionToCall = availableFunctions[functionName];
          const functionArgs = JSON.parse(toolCall.function.arguments);
          console.log("calling function : ", functionName, functionArgs)
          const functionResponse = await functionToCall(functionArgs);
          console.log("function response : ", functionResponse)


          chatSessions[clientId].push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: functionResponse,
          }); 
        }
      } else if (!chatSessions[clientId][chatSessions[clientId].length - 1].tool_calls) {
          chatSessions[clientId].push(responseMessage); // extend conversation with assistant's reply
          continueConversation = false; // exit the loop if no function call is needed
      }
    } catch (error) {
      console.error("OpenAI API error:", error);
      return res.status(500).json({ error: "Error communicating with OpenAI API" });
    }
  }

  res.send(chatSessions[clientId][chatSessions[clientId].length - 1].content);
});


// Health check endpoint for AWS
app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
const tools = [
    {
      type: "function",
      function: {
        name: "action_get_corp_code",
        description: "Get the corporation code by corporation name (",
        parameters: {
          type: "object",
          properties: {
            corpName: {
              type: "string",
              description: "The name of the corporation in KOREAN",
            }
          },
          required: ["corpName"]
        },
      }
    },
//   {
//     type: "function",
//     function: {
//       name: "action_get_single_company_key_financials",
//       description: "Get the single company key finacials of a corporation by its code, business year, report code, and financial statement division",
//       parameters: {
//         type: "object",
//         properties: {
//           corp_code: {
//             type: "string",
//             description: "The unique number of the corporation (8 characters)"
//           },
//           bsns_year: {
//             type: "string",
//             description: "The business year (4 characters)"
//           },
//           reprt_code: {
//             type: "string",
//             description: "The report code (5 characters). 1Q report: 11013, Half-year report: 11012, 3Q report: 11014, Annual report: 11011"
//           },
//           fs_div: {
//             type: "string",
//             description: "The division of financial statement. OFS: Individual financial statement, CFS: Consolidated financial statement"
//           }
//         },
//         required: ["corp_code", "bsns_year", "reprt_code", "fs_div"]
//       }
//     },
//   },

  {
    type: "function",
    function: {
      name: "action_get_company_index",
      description: "Get the company index by corporation code, business year, report code, and index classification code",
      parameters: {
        type: "object",
        properties: {
          corp_code: {
            type: "string",
            description: "The unique number of the corporation (8 characters)"
          },
          bsns_year: {
            type: "string",
            description: "The business year (4 characters)"
          },
          reprt_code: {
            type: "string",
            description: "The report code (5 characters). 1Q report: 11013, Half-year report: 11012, 3Q report: 11014, Annual report: 11011"
          },
          idx_cl_code: {
            type: "string",
            description: "The index classification code. Profitability index: M210000, Stability index: M220000, Growth index: M230000, Activity index: M240000"
          }
        },
        required: ["corp_code", "bsns_year", "reprt_code", "idx_cl_code"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "action_get_multi_account",
      description: "Get the multi account details by corporation code, business year, and report code",
      parameters: {
        type: "object",
        properties: {
          corp_code: {
            type: "string",
            description: "The unique number of the corporation (8 characters)"
          },
          bsns_year: {
            type: "string",
            description: "The business year (4 characters)"
          },
          reprt_code: {
            type: "string",
            description: "The report code (5 characters). 1Q report: 11013, Half-year report: 11012, 3Q report: 11014, Annual report: 11011"
          }
        },
        required: ["corp_code", "bsns_year", "reprt_code"]
      }
    }
  }
  ];

  module.exports = tools;
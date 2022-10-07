module.exports = ({
    tenderName,
    email,
    tenderValue,
    withdraw,
    name,
    emdNumber,
    endDate,
    amountWords,
    organization,
    phoneno,
    admin,
    isVerified,
    edm,
    pan,
    aadhar,
}) => {
    // const today = new Date();
    const date = new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Calcutta",
    });
    const today =Date.now();
    const time = new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Calcutta",
    });
    const imgLogo =
        "https://yt3.ggpht.com/rKAfQnmLP8A6rHGwDHGCrrEc31Km9eps7MrW4NCbjsfzSkbMQmsXDuk0l-sNA6-ApRgCeKHj-g=s900-c-k-c0x00ffffff-no-rj";
    let verificationStatus = "";
    if (tenderName) {
        verificationStatus = "Verified";
    } else {
        verificationStatus = "Not Verified";
    }
    return `
  <!doctype html>
  <html>

  <head>
      <meta charset="utf-8">
      <title>Application form Pdf</title>
      <style>
          * {
              padding: 0;
              margin: 0;
              box-sizing: border-box;
          }

          body {
            height: 100%;
            width:100%;
            padding:1rem 1.6rem 0 1.6rem;
            margin: 0px 0px 0px 0px;
            background-size: 100% 100%;
            background-repeat: no-repeat;
            font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif;
        }
        .date {
            position:absolute;
            top:0;
            left:0;
            font-size: 8px;
        }
          table,
          th,
          td {
              border: 1px solid black;
              border-collapse: collapse;
          }

          th,
          td {
              padding: 3px;
              border-color: gray;
              font-size: 10px;
          }
          .application {
            position:relative;
          }

          th {
              background-color: rgba(245, 245, 245, 0.811);
              padding:5px;

          }

          td {
              font-size: 10px !important;
              text-align:center;
              padding:5px;
          }

          .title {
              display: flex;
              flex-direction:row;
              justify-content: center;
              align-items: center;
              text-align:center;
              margin-bottom: 10px;
              font-family: sans-serif;
              width:100%;
              margin-top:8px;
          }

          .title img {

              margin: 0px;
              width: 2.35rem;
          }
          .title .col-flex{
            display:flex;
            flex-direction:column;
          }
          .title h2 {
              line-height: 1.4;
              text-align: center;
              font-size: 1.2rem;
          }

          .title p {
              line-height: 1.2;
              font-size:12px;
          }

          th {
              text-align: center;
              padding:5px;
          }

          .student_details_table img {
              width: 90px;
              height: 95px;
          }

          caption {
              font-size: 12px;
              padding: 4px 0;
              margin-bottom:60px;
          }

          .student_details_table,
          .contact_details_table,
          .academic_details_table,
          .personal_details_table {
              padding: 1%;
              margin:6px 0;
          }

          .sign {
              width: 100%;
              text-align: right;
              font-size: 0.8rem;
              padding: 39px 20px 15px 30px;
              font-weight: 600;
          }
          .star{
            text-align:center;
            display:flex;
            justify-content:center;
          }
      </style>
  </head>

  <body>
      <div class="application">
          <div class="title">
                <img src=${imgLogo} alt="" />
                  <div class="col-flex">
                  <h2>Murudeshwara Temple Tender</h2>
                  <p>Gangavati, Bhatkal Taluk, Murudeshwar, North Kanara, Karnataka 581350</p>
                  </div>
          </div>

          <div class="complete_table">
              <div class="student_details_table">
                  <table style="width:100%">
                      <caption>Vendor Details</caption>
                      <tr>
                          <th>Name</th> 
                          <th>TenderName</th> 
                          <th>Origanization</th> 
                          <th>Phone No</th> 
                          </tr>
                      <tr>
                          <td>${name}</td>
                          <td>${tenderName}</td>
                          <td>${organization}</td>
                          <td>${phoneno}</td>
                      </tr>

                      <tr>
                          <th>Admin</th>
                          <th colspan="1">Email</th>
                          <th>Tender Value</th>
                          <th>Transaction Number</th>
                      </tr>
                      <tr>
                          <td>${admin}</td>
                          <td colspan="1">${email}</td>
                          <td>${tenderValue}</td>
                          <td>${emdNumber}</td>
                      </tr>
                  </table>
              </div>

              <div class="contact_details_table">
                  <table style="width:100%;border-collapse:collapse">
                      <caption>Contact details</caption>
                      <tr>
                          <th>End Date</th>
                          <th colspan="2">Aadhar Number</th>
                          <th>Amount</th>
                      </tr>

                      <tr>
                          <td>${endDate}</td>
                          <td style="letter-spacing: 1.1px" colspan="2">${name}</td>
                          <td>${amountWords}</td>
                      </tr>
                  </table>
              </div>

              <p class="date">Tender Acknowledge Number: ACK${phoneno}${tenderName}${date}${time}</p>
              <p class="star">*****</p>
          </div>
          </div>

          </body>

  </html>    `;
};

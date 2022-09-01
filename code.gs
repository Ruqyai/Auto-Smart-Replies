
//adds a custom menu to run scripts.
function onOpen() {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu("Auto Smart Reply")
    .addItem("Enable auto smart replies", "installTrigger")
    .addToUi();
}

//installs a trigger to response when anyone submit a feedback.
function installTrigger() {
  ScriptApp.newTrigger("onFormSubmit")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onFormSubmit()
    .create();
}

// send auto smart email for every response on a form 
function onFormSubmit(e) {
  let responses = e.namedValues;
  let timestamp = responses.Timestamp[0];
  let email = responses["Email address"][0].trim();
  let emailBody = createEmailBody(responses)[0];
  let feedback = createEmailBody(responses)[1];
  // send email
  sendEmail(timestamp, email, emailBody, feedback);
}

// create email body
function createEmailBody(responses) {
  // parse form response data
  let name = responses.Name[0].trim();
  let feedback = responses["Please write your feedback"][0];
  let rating = responses["On a scale of 1 - 5 how would you rate this workshop?"][0];

  // create email body
  let htmlBody =
    "Hi " + name + ",<br><br>" +
    "Thank you for your feedback. It's really useful to us to help improve our future workshops.<br><br>" +
    "Have a great day!<br><br>" +
    "Thanks,<br>" +
    "Ruqiya Bin Safi <br>" +
    "<b><i>-----------------------------------------------</b></i><br>" +
    "<i>Your feedback:</i><br>" +
    "<b><i>Please write your feedback </b></i><br>" +
    feedback + "<br>" +
    "<b><i>On a scale of 1 - 5 how would you rate this workshop?</b></i><br>" +
    rating + "<br>";

  return [htmlBody, feedback];
}

// for sending a smart email
function sendEmail(timestamp, email, emailBody, feedback) {
  // NLP model API
  var data = {data: feedback,};
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data),};
  var response = UrlFetchApp.fetch(
    "https://hf.space/embed/Ruqiya/RS/+/api/predict",
    options);
  var res = response.getContentText();
  // check if the response positive or negative to send the suitable e mail
  let msg = "";
  if (res.substring(1, 30).includes("negative")) {
    msg = "We will do our best to be better.  ";
  } else {
    msg = "Thank you so much for your lovely feedback. ";
  }
  //send email
  let subjectLine = msg + " [" + timestamp + " ]";
  MailApp.sendEmail({
    to: email,
    subject: subjectLine,
    htmlBody: "<img src='https://i.ibb.co/kcBWg3m/w.png' width='50%' height='50%'> <br><h2>" +
    msg +"</h2><br>" +emailBody,
  });
}

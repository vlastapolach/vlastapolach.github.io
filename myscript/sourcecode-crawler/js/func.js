var subString = "";
var redirectData = [];
var domNew = "";
var j = 0;
var errorCount = 0;
var total;
var oldVal = "";
var newVal = "";

function enableBtn() {
  oldVal = $("#oldUrl").val();
  newVal = $("#newUrl").val();
  if (oldVal !== "" && newVal !== "") {
    $("#proceed").removeClass("disabled");
    $("#proceed").removeClass("btn-danger");
    $("#proceed").addClass("btn-primary");
  } else {
    $("#proceed").addClass("disabled");
    $("#proceed").removeClass("btn-primary");
    $("#proceed").addClass("btn-danger");
  }
}
$("#oldUrl").keyup(enableBtn);
$("#newUrl").keyup(enableBtn);

function subStr() {
  subString = $("#oldUrl").val();
}

// Custom error/success messages to show in HTML Console log box
function customLog(logMsg) {
  var textbox = document.getElementById("logRes");
  textbox.value += logMsg;
  textbox.scrollTop = textbox.scrollHeight;
}

$("#oldUrl").change(subStr);
// Get source code of the URL
function getSourceAsDOM(url) {
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", url, false);
  parser = new DOMParser();
  try {
    xmlhttp.send();
  } catch (err) {
    domNew = "Error";
  }
  domNew = xmlhttp.responseText;
  return parser.parseFromString(xmlhttp.responseText, "text/html");
}

// Run the searching with button click
$("#proceed").click(function() {
  event.preventDefault();

  if ($("#proceed").hasClass("disabled")) {
    console.log("Not possible - fill in Search phrase and List of URLs.");
  } else {
    // read input values
    subString = $("#oldUrl").val();
    var newUrla = $("#newUrl").val();
    var download = $("#download").val();

    // read URLs and line by line save them as an object
    var newLines = $("#newUrl").val().split(/\n/);
    var newUrlResult = [];

    customLog(" Total count: " + newLines.length + " URLs \n");

    total = newLines.length;

    for (var num = 0; num < newLines.length; num++) {
      setTimeout(
        (function(x) {
          return function() {
            var newUrlString = newLines[j];
            getSourceAsDOM(newLines[j]);
            var isThere = domNew.search(subString);
            // If found, save the search phrase
            if (isThere !== -1) {
              redirectData.push({
                NewURL: newLines[j],
                SearchSubstring: subString
              });
              customLog(
                "✅  " +
                (j + 1) +
                ": " +
                newLines[j] +
                ' - phrase "' +
                subString +
                '" was found\n');
              j++;
              if (j === total) {
                completeFnc();
              }
            } else if (domNew == "") {
              // If URL doesn't work/exist, save "URL Error"
              redirectData.push({
                NewURL: newLines[j],
                SearchSubstring: "URL Error"
              });
              customLog(
                "⛔  " + (j + 1) + ": " + newLines[j] + " - URL Error\n");
              j++;
              errorCount++;
              if (j === total) {
                completeFnc();
              }
            } else {
              // If not found, save "Not Found"
              redirectData.push({
                NewURL: newLines[j],
                SearchSubstring: "Not Found"
              });
              customLog(
                "🔍  " + (j + 1) + ": " + newLines[j] + " - phrase not found\n");
              j++;
              if (j === total) {
                completeFnc();
              }
            }
          }; //return function
        })(num),
        0 + num * 200
      ); //timeout
    }

    var completeFnc = function() {
      if (newLines.length == errorCount) {
        customLog(
          "🌍  Network error - try to disable/enable cross-origin resource sharing (A-C-A-O* plugin)\n");
      } else {
        customLog("*** COMPLETED *** \n");
      }

      // Enable download button
      $("#download").removeClass("disabled");
      $("#download").removeClass("btn-danger");
      $("#download").addClass("btn-primary");
    };

    // Disable proceed button
    $("#proceed").addClass("disabled");
    $("#proceed").addClass("btn-danger");
  }
});

// Print actual year into the footer
var year = new Date();
$(".foot-link").text(year.getFullYear());

/* Download as CSV script from https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/ */

// Convert Objects to CSV
function convertArrayOfObjectsToCSV(args) {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

  data = args.data || null;
  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = args.columnDelimiter || ",";
  lineDelimiter = args.lineDelimiter || "\n";

  keys = Object.keys(data[0]);

  result = "";
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function(item) {
    ctr = 0;
    keys.forEach(function(key) {
      if (ctr > 0) result += columnDelimiter;

      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

// Download as CSV
function downloadCSV(args) {
  var data, filename, link;

  var csv = convertArrayOfObjectsToCSV({
    data: redirectData
  });
  if (csv == null) return;

  filename = "crawler-export.csv";

  if (!csv.match(/^data:text\/csv/i)) {
    csv = "data:text/csv;charset=utf-8," + csv;
  }
  data = encodeURI(csv);

  link = document.createElement("a");
  link.setAttribute("href", data);
  link.setAttribute("download", filename);
  link.click();
}

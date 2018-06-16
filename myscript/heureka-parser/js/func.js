var category = "";
var urlHeur = "https://obchody.heureka.cz/";
var redirectData = [];
var domNew = "";
var subString = '<p><a href="https://www.heureka.cz/exit';
var arrayURLs = [];
var arrayURLs2 = [];
var arrayURLs3 = [];
var arrayURLs4 = [];
var testNum = 0;
var textNum = 0;
var textbox = document.getElementById('logRes');


function categoryName() {
  category = $('#oldUrl').val();
}

$('#oldUrl').change(categoryName);
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
$("#proceed").one("click", function() {
  event.preventDefault();
  // Disable proceed button
  $("#proceed").addClass("disabled");
  $("#proceed").addClass("btn-danger");
  // read input values
  category = $('#oldUrl').val();
  var download = $("#download").val();

  // Search in all 15 pages of the category
  for (var page = 1; page < 16; page++) {

    setTimeout(function(x) {
      return function() {
        if (category == "") {
          urlHeur = "https://obchody.heureka.cz/";
        } else {
          urlHeur = "https://obchody.heureka.cz/" + category + "/?f=" + x;
        }

        getSourceAsDOM(urlHeur);

        if (domNew == "") {
          textbox.value += "⛔  Page " + x + " Error\n";
          textbox.scrollTop = textbox.scrollHeight;
          textNum++
          if (textNum === 15) {
            textbox.value += "🌍  Network error - try to disable/enable cross-origin resource sharing (A-C-A-O* plugin)\n";
            textbox.scrollTop = textbox.scrollHeight;
          }
        }
        else {
          textbox.value += "🆗  Page " + x + " done. " + urlHeur + "\n";
          textbox.scrollTop = textbox.scrollHeight;
        }

        var newLines = domNew.split(/\n/);

        //Search every line on the page for the shop URL and save it to arrayURLs
        for (var j = 0; j < newLines.length; j++) {
          var newUrlString = newLines[j];

          var isThere = newLines[j].search(subString);
          // If found, save the search phrase
          if (isThere !== -1) {
            arrayURLs.push(newLines[j]);
          }
        } //line for loop

        if (x == 15) {
          // get URLs from arrayURLs and clear the URL
          for (k = 0; k < arrayURLs.length; k++) {
            arrayURLs2[k] = arrayURLs[k].split('_blank">');
            arrayURLs3[k] = arrayURLs2[k][1].split('</a>');
            arrayURLs4[k] = arrayURLs3[k][0];
          } //arrayURLs for loop

        } //if x == 15

          var completeFnc = function() {
          var textbox = document.getElementById('logRes');
          textbox.value += '*** COMPLETED *** \n';
          textbox.scrollTop = textbox.scrollHeight;
          // Enable download button
          $("#download").removeClass("disabled");
          $("#download").removeClass("btn-danger");
          $("#download").addClass("btn-primary");
        }
        //Check if URL is valid
        for (l = 0; l < arrayURLs4.length; l++) {

          $.ajax({
            type: 'HEAD',
            url: 'https://' + arrayURLs4[l],
            success: function() {
              redirectData.push({
                link: 'https://' + arrayURLs4[testNum]
              });
              var textbox = document.getElementById('logRes');
              textbox.value += "🔐  " + testNum + ': https://' + arrayURLs4[testNum] + " added \n";
              textbox.scrollTop = textbox.scrollHeight;
              testNum++;
              if (testNum == arrayURLs4.length) {
                completeFnc()
              }
            },
            error: function() {
              redirectData.push({
                link: 'http://' + arrayURLs4[testNum]
              })
              var textbox = document.getElementById('logRes');
              textbox.value += "🔓  " + testNum + ': http://' + arrayURLs4[testNum] + " added \n";
              textbox.scrollTop = textbox.scrollHeight;
              testNum++;
              if (testNum == arrayURLs4.length) {
                completeFnc()
              }
            }
          });
        } //for loop

      } //return function
    }(page), 0 + page * 200) //timeout

  } //page for loop
}); //click function

$("#proceed").click(function() {
  event.preventDefault();
});
/* Download as CSV script from https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/ */

// Convert Objects to CSV
function convertArrayOfObjectsToCSV(args) {
  var result, ctr, keys, columnDelimiter, lineDelimiter, data;

  data = args.data || null;
  if (data == null || !data.length) {
    return null;
  }

  columnDelimiter = args.columnDelimiter || ',';
  lineDelimiter = args.lineDelimiter || '\n';

  keys = Object.keys(data[0]);

  result = '';
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

  filename = 'export-' + category + '.csv';

  if (!csv.match(/^data:text\/csv/i)) {
    csv = 'data:text/csv;charset=utf-8,' + csv;
  }
  data = encodeURI(csv);

  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  link.click();
}

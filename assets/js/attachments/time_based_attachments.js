
var attachments_data = [];
// Function to check selections in attachment export component
async function checkAttachmentSelections() {
    var attachmentTemplateSelect = document.getElementById('attachmentTemplateSelect');

    var selectedOption_template = attachmentTemplateSelect.options[attachmentTemplateSelect.selectedIndex];

    var selectedValue_temp = selectedOption_template.value;
    selected_template = selectedValue_temp;

    if (attachmentTemplateSelect.value) {
        showLoader();
        document.getElementById('attachmentTablePlaceholder').classList.remove('d-none');

        console.log('attachments_time_start-', start_time)
        console.log('attachments_time_end-', end_time)

        var t_start = ticketformatDateToUnixTimestamp(start_time);
        var t_end = ticketformatDateToUnixTimestamp(end_time);

        attachments_data = await AttachCommentInfo(t_start, t_end)
        console.log('attachments_data-------', attachments_data)
        if (attachments_data && attachments_data.length) {
            hideLoader();
            var viewSelectMessage = $('#attachSelectMessage');
            var lengthMessage = 'This view contains' + attachments_data.length + ' tickets.';
            viewSelectMessage.text(lengthMessage).show();
        } else {
            hideLoader();
            var viewSelectMessage = $('#attachSelectMessage');
            var lengthMessage = 'This view contains 0 tickets.';
            viewSelectMessage.text(lengthMessage).show();
        }
    } else {
        hideLoader();
        document.getElementById('attachmentTablePlaceholder').classList.add('d-none');
        attachmentViewSelectMessage.style.display = 'none';
    }
    return attachments_data;
}

attachValuesArray = [];
dict = {};
// Function to add attachment field to table
function addAttachmentFieldToTable() {
    var attachmentAddFieldSelect = document.getElementById('attachmentAddFieldSelect');

    // ##############################
    // Get the selected option
    var selectedOption = attachmentAddFieldSelect.options[attachmentAddFieldSelect.selectedIndex];

    // Hide the selected option
    selectedOption.style.display = "none";
    // ##############################

    var selectedOption = attachmentAddFieldSelect.options[attachmentAddFieldSelect.selectedIndex];
    var fieldClass = selectedOption.className;
    var field_val = selectedOption.value;
    var field = selectedOption.text;
    var type = 'text';


    if (fieldClass.toLowerCase().includes('a-attachment')) {
        attachValuesArray.push(field_val);
    }
//    else if (fieldClass.toLowerCase().includes('a-audit')) {
//        auditValuesArray.push(field_val);
//    }


    // Add a new row to the table if a field is selected
    if (field) {
        var table = document.getElementById('attachmentFieldMappingTable').getElementsByTagName('tbody')[0];
        var newRow = table.insertRow();
        var iconCell = newRow.insertCell(0);
        var fieldCell = newRow.insertCell(1);
        var groupCell = newRow.insertCell(2);
        var typeCell = newRow.insertCell(3);
        var deleteCell = newRow.insertCell(4);

        iconCell.innerHTML = '<i class="bi bi-grip-vertical"></i>';
        fieldCell.textContent = field;
        groupCell.textContent = 'Attachment'; // Assuming all fields belong to the "Attachment" group
        typeCell.textContent = type;
        deleteCell.innerHTML = '<button class="btn btn-sm" style="color: #007bff;" onclick="deleteAttachmentRow(this)"><i class="bi bi-trash"></i></button>';

        // Reset the select dropdown
        attachmentAddFieldSelect.selectedIndex = 0;
    }
    dict = {
        "attachValuesArray": attachValuesArray,
    };
}

// Function to delete attachment row from table
function deleteAttachmentRow(btn) {
    // Find the row and remove it
    var row = btn.closest('tr');

    // Get the field value from the first cell of the row
    var fieldValue = row.cells[1].textContent.trim();

    // Show the corresponding option in the select element
    var addFieldSelect = document.getElementById('attachmentAddFieldSelect');


    // Find the selected option based on text content
    var selectedOption;
    for (var i = 0; i < addFieldSelect.options.length; i++) {
        if (addFieldSelect.options[i].text === fieldValue) {
            selectedOption = addFieldSelect.options[i];
            break;
        }
    }

    if (!selectedOption) {
        console.error('Selected option not found');
        return;
    }

    // Remove the field from arrays only if it matches with the selected option
    if (attachValuesArray.includes(selectedOption.value)) {
        var indexComment = attachValuesArray.indexOf(selectedOption.value);
        attachValuesArray.splice(indexComment, 1);
    }

    dict = {
        "attachValuesArray": attachValuesArray,
    };

    // Unhide the option in the select dropdown
    selectedOption.style.display = '';

    // Remove the row
    row.parentNode.removeChild(row);
}


// FETCH COMMENT DATA FROM API
async function AttachCommentInfo(start, end) {
    try {
        var Updated_Array = [];
        var url = `${zendesk_domain}/api/v2/incremental/tickets.json?start_time=${start}&end_time=${end}`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        console.log('url--', url);
        const data = await client.request(settings);
        const ticketsArray = data['tickets'];

        for (var i = 0; i < ticketsArray.length; i++) {
            var ticket = ticketsArray[i];

            var AttachApiData = await AttachmentCommentData(ticket["id"]);

            var new_dict = {
                'attachment_data':AttachApiData,
            }
            Updated_Array.push(new_dict);
        }
    } catch (error) {
        console.error('Error fetching comments ticket info:---', error);
    }
    return Updated_Array;
}

async function AttachmentCommentData(id) {
    var commentsData = [];
    var AttachmentData = {};
    try {
        var url = `${zendesk_domain}/api/v2/tickets/${id}/comments`;
        var settings = {
            url: url,
            type: 'GET',
            dataType: 'json',
        };
        console.log('url--', url);
        const Data = await client.request(settings);
        commentsData = Data['comments'];
        for (var i = 0; i < commentsData.length; i++) {
            try {
                var cmt = commentsData[i];
                if (cmt['attachments'] && cmt['attachments'].length > 0) {
                    var a_id = cmt['attachments'][0]['id'];
                    var AttachmentData = await AttachmentsData(a_id);
                }
            } catch (error) {
                console.error('Error fetching comments', error);
            }
        }
    } catch (error) {
        console.error('Error fetching comments data info:---', error);
    }
    return AttachmentData;
}

//async function AttachmentsData(id) {
//    var AmentData = {};
//    try {
//        var url = `${zendesk_domain}/api/v2/attachments/${id}/`;
//        var settings = {
//            url: url,
//            type: 'GET',
//            dataType: 'json',
//        };
//        console.log('url--', url);
//        const Data = await client.request(settings);
//        AmentData = Data['attachment'];
//    } catch (error) {
//        console.error('Error fetching attachment data info:---', error);
//    }
//    return AmentData;
//}


// Function to create a CSV file from selected fields
async function createAttachmentContent(attachments_data, dict) {
    console.log('i am here....');
    try {
        var selectedFieldsArray = [];
        for (var i = 0; i < attachments_data.length; i++) {
            try {
                var ticket = attachments_data[i];

                console.log('Attachment Ticket-----');
                var selectedFieldsObject = {};
                // ***************************************************
                // attachment data
                var select_comment_data = dict['attachValuesArray'];
                for (var j = 0; j < select_comment_data.length; j++) {
                    try {
                      var field = select_comment_data[j];
                      if (field !== null){
                        if (ticket[field] !== null && ticket[field] !== undefined) {
                            if (ticket['attachment_data'] && ticket['attachment_data'][field] !== undefined) {
                                selectedFieldsObject[field] = '"' + ticket['attachment_data'][field] + '"';
                              } else {
                                selectedFieldsObject[field] = '';
                              }
                        }else{
                            selectedFieldsObject[field] = '';
                        }
                      }else{
                        selectedFieldsObject[field] = '';
                      }


                    } catch (error) {
                      console.error('Error in attachment fields:', error);
                    }
                }
                selectedFieldsArray.push(selectedFieldsObject);
            }catch (error) {
                console.error('Error in selected field:', error);
            }

        }
//        // Convert the arrays to CSV format
//        var csv = convertArrayOfObjectsToCSV(selectedFieldsArray);
//        downloadCSV(csv, 'ticket-export.csv');

        console.log("Selected Template:", selected_template);
        if (selected_template == 'JSON'){
            // Convert the arrays to JSON format
            var jsonContent = JSON.stringify(selectedFieldsArray, null, 2);
            if(jsonContent) {
                downloadJSON(jsonContent, 'ticket-export.json');
            } else {
                console.error('Error generating JSON data.');
            }
        }else if (selected_template == 'XML') {
            // Convert the arrays to XML format
            var xml = convertArrayOfObjectsToXML_attach(selectedFieldsArray);
            if(xml) {
                downloadXML(xml, 'ticket-export.xml');
            } else {
                console.error('Error generating XML data.');
            }
        }else{
            var csv = convertArrayOfObjectsToCSV(selectedFieldsArray);
            if (csv) {
                downloadCSV(csv, 'ticket-export.csv');
            } else {
                console.error('Error generating CSV data.');
            }
        }

    } catch (error) {
        console.error('Error in attachment create Content function:', error);
    }
}


// Add an event listener to the "Export" button
document.getElementById('attachment_export_Button').addEventListener('click', async function () {
    try {
        console.log('onclick attachment export button:');
        addAttachmentFieldToTable();
        console.log('attachment dict data which one you select(fields)', dict);

        console.log('attachment data api data your tickets:', attachments_data);
        await createAttachmentContent(attachments_data, dict);
    } catch (error) {
        console.error('Error fetching onclick attachment export button:', error);
    }
});

//***********************************************************************************************************
// Function to convert an array of objects to XML format
function convertArrayOfObjectsToXML_attach(ticketArray) {
    try {
        if (!ticketArray || ticketArray.length === 0) {
            console.error('Array is empty or undefined');
            return '';
        }

        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<attachments>\n';

        for (var i = 0; i < ticketArray.length; i++) {
            var ticketObject = ticketArray[i];
            xml += '<attachment>\n';

            for (var key in ticketObject) {
                if (ticketObject.hasOwnProperty(key)) {
                    // Ensure valid XML element name by replacing invalid characters
                    var sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
                    xml += `<${sanitizedKey}>${escapeXml(ticketObject[key])}</${sanitizedKey}>\n`;
                }
            }

            xml += '</attachment>\n';
        }

        xml += '</attachments>';
        return xml;
    } catch (error) {
        console.error('Error converting array to XML:', error);
        return '';
    }
}
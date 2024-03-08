var client = ZAFClient.init();

document.addEventListener('DOMContentLoaded', function () {
  client.invoke('resize', { width: '100%', height: '300px' });
  requestUserInfo(client);
});

function requestUserInfo(client) {
  // Use 'let' to define 'id' variable
  let id;

  client.get('ticket.requester.id').then(
    function (data) {
      id = data['ticket.requester.id'];

      var settings = {
        url: 'https://testai6026.zendesk.com/api/v2/users/' + id + '.json',
        type: 'GET',
        dataType: 'json',
      };

      console.log('settings for user info ---->', settings);

      client.request(settings).then(
        function (data) {
          console.log('user data ---->', data);
        },
        function (response) {
          console.log('user info response ---->', response);
        }
      );
    }
  );
}


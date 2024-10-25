// public/controllers/PollController.js
angular.module('myApp')
  .controller('PollController', function($scope, $http) {
    const POLL_VOTE_KEY = 'hasVoted';
    const VOTE_OPTION_KEY = 'selectedOption';

    $scope.message = '';
    $scope.consentGiven = false; // Initialize consent as false

    // Check if the user has already voted and has given consent
    if (localStorage.getItem(POLL_VOTE_KEY) === 'true') {
      $scope.hasVoted = true;
      $scope.consentGiven = true;
    }

    // Fetch poll data
    $http.get('/api/poll')
      .then(response => {
        $scope.poll = response.data;
      })
      .catch(error => {
        console.error('Error fetching poll data:', error);
      });

    // Submit a vote
    $scope.submitVote = function() {
      // Check if user has already voted
      if ($scope.hasVoted) {
        $scope.message = 'You have already voted. Thank you!';
        return;
      }

      // Check if a valid option is selected
      if (!$scope.selectedOption) {
        $scope.message = 'Please select an option!';
        return;
      }

      $http.post('/api/vote', { optionId: $scope.selectedOption })
        .then(response => {
          if (response.data.success) {
            $scope.message = 'Thank you for voting!';
            // Save voting status and selected option in local storage if user consents
            if ($scope.consentGiven) {
              localStorage.setItem(POLL_VOTE_KEY, 'true');
              localStorage.setItem(VOTE_OPTION_KEY, $scope.selectedOption);
              $scope.hasVoted = true;
            }
            // Update poll data after voting
            return $http.get('/api/poll');
          }
        })
        .then(response => {
          $scope.poll = response.data;
          $scope.selectedOption = null; // Clear selection after voting
        })
        .catch(error => {
          console.error('Error submitting vote:', error);
          $scope.message = 'An error occurred. Please try again.';
        });
    };

    // Function to withdraw consent and retract vote
    $scope.withdrawConsent = function() {
      const selectedOption = localStorage.getItem(VOTE_OPTION_KEY);

      if (selectedOption) {
        // Retract the vote by calling the server
        $http.post('/api/retractVote', { optionId: parseInt(selectedOption) })
          .then(response => {
            if (response.data.success) {
              $scope.message = 'Your vote has been removed and consent withdrawn.';
              localStorage.removeItem(POLL_VOTE_KEY);
              localStorage.removeItem(VOTE_OPTION_KEY);
              $scope.hasVoted = false;
              $scope.consentGiven = false;
              // Refresh poll data after vote retraction
              return $http.get('/api/poll');
            }
          })
          .then(response => {
            $scope.poll = response.data;
          })
          .catch(error => {
            console.error('Error retracting vote:', error);
            $scope.message = 'An error occurred while retracting your vote. Please try again.';
          });
      } else {
        $scope.message = 'No vote to retract. You can vote again if you choose to give consent.';
        localStorage.removeItem(POLL_VOTE_KEY);
        $scope.hasVoted = false;
        $scope.consentGiven = false;
      }
    };
  });

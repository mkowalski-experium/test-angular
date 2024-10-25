// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Route to get poll data
app.get('/api/poll', (req, res) => {
  fs.readFile('polls.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading poll data');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// Route to submit a vote
app.post('/api/vote', (req, res) => {
  const optionId = req.body.optionId;

  fs.readFile('polls.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading poll data');
      return;
    }

    const poll = JSON.parse(data);
    const option = poll.options.find(opt => opt.id === optionId);
    if (option) {
      option.votes += 1;

      fs.writeFile('polls.json', JSON.stringify(poll, null, 2), 'utf8', err => {
        if (err) {
          res.status(500).send('Error saving vote');
          return;
        }
        res.json({ success: true });
      });
    } else {
      res.status(404).send('Option not found');
    }
  });
});

// Route to retract a vote
app.post('/api/retractVote', (req, res) => {
  const optionId = req.body.optionId;

  fs.readFile('polls.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading poll data');
      return;
    }

    const poll = JSON.parse(data);
    const option = poll.options.find(opt => opt.id === optionId);
    if (option && option.votes > 0) {
      option.votes -= 1;

      fs.writeFile('polls.json', JSON.stringify(poll, null, 2), 'utf8', err => {
        if (err) {
          res.status(500).send('Error retracting vote');
          return;
        }
        res.json({ success: true });
      });
    } else {
      res.status(404).send('Option not found or no votes to retract');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

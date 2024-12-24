const express = require('express');
const router = express.Router();
const timetable = require('./timetable');

router.get('/', (req, res) => {
    timetable({ type: 'get' }).get((result) => {
        res.json(result);
    });
});

router.post('/', (req, res) => {
    timetable({ type: 'post', body: req.body }).post((result) => {
        res.json(result);
    });
});

router.put('/:id', (req, res) => {
    timetable({ type: 'put', body: req.body, id: req.params.id }).put((result) => {
        res.json(result);
    });
});

router.delete('/:id', (req, res) => {
    timetable({ type: 'delete', id: req.params.id }).delete((result) => {
        res.json(result);
    });
});

module.exports = router;
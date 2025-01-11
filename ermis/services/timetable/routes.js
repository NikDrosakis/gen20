const express = require('express');
/**
 * @type {express.Router}
 * Express router object
 */
const router = express.Router();
const timetable = require('./timetable');

/**
 * GET route to retrieve timetable data.
 * @name get/
 * @route {GET} /
 * @params {}
 */
router.get('/', (req, res) => {
    timetable({ type: 'get' }).get((result) => {
        res.json(result);
    });
});

/**
 * POST route to create or update timetable data.
 * @name post/
 * @route {POST} /
 * @params {
 "body": {
 "type": "object",
 "description": "The object with data to use for updating/creating records",
 "in": "body",
 "required": false
 }
 }
 */
router.post('/', (req, res) => {
    timetable({ type: 'post', body: req.body }).post((result) => {
        res.json(result);
    });
});

/**
 * PUT route to update timetable data by ID.
 * @name put/:id
 * @route {PUT} /:id
 *  @params {
 "id": {
 "type": "string",
 "description": "ID of record to be updated",
 "in": "path",
 "required": true
 },
 "body": {
 "type": "object",
 "description": "Object with data to update record",
 "in": "body",
 "required": false
 }
 }
 */
router.put('/:id', (req, res) => {
    timetable({ type: 'put', body: req.body, id: req.params.id }).put((result) => {
        res.json(result);
    });
});

/**
 * DELETE route to delete timetable data by ID.
 * @name delete/:id
 * @route {DELETE} /:id
 *  @params {
 "id": {
 "type": "string",
 "description": "ID of the record to delete",
 "in": "path",
 "required": true
 }
 }
 */
router.delete('/:id', (req, res) => {
    timetable({ type: 'delete', id: req.params.id }).delete((result) => {
        res.json(result);
    });
});

module.exports = router;
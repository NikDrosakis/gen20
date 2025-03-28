const express = require('express');
const router = express.Router();
const timetable = require('./timetable');
const actiongrp = "timetable"; // Define the action group
let a = [];

// 1. Get Timetable
a.push({
    actiongrp: actiongrp,
    name: "timetable_get",
    description: "Retrieves the timetable data",
    meta: "GET,/",
    params: JSON.stringify({
        url: "/",
        method: "GET",
    })
});
router.get('/', (req, res) => {
    timetable({ type: 'get' }).get((result) => {
        res.json(result);
    });
});

// 2. Create Timetable Entry
a.push({
    actiongrp: actiongrp,
    name: "timetable_create",
    description: "Creates a new timetable entry",
    meta: "POST,/",
    params: JSON.stringify({
        url: "/",
        method: "POST",
        body: {
            // Define your expected body parameters
        }
    })
});
router.post('/', (req, res) => {
    timetable({ type: 'post', body: req.body }).post((result) => {
        res.json(result);
    });
});


// 3. Update Timetable Entry
a.push({
    actiongrp: actiongrp,
    name: "timetable_update",
    description: "Updates an existing timetable entry by ID",
    meta: "PUT,/:id",
    params: JSON.stringify({
        url: "/{id}",
        method: "PUT",
        body: {
            // Define your expected body parameters
        }
    })
});
router.put('/:id', (req, res) => {
    timetable({ type: 'put', body: req.body, id: req.params.id }).put((result) => {
        res.json(result);
    });
});

// 4. Delete Timetable Entry
a.push({
    actiongrp: actiongrp,
    name: "timetable_delete",
    description: "Deletes a timetable entry by ID",
    meta: "DELETE,/:id",
    params: JSON.stringify({
        url: "/{id}",
        method: "DELETE",
    })
});
router.delete('/:id', (req, res) => {
    timetable({ type: 'delete', id: req.params.id }).delete((result) => {
        res.json(result);
    });
});

require('../../action').add(a);
module.exports = router;
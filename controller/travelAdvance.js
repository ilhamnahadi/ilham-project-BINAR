const client = require('../database/db');

// ROUTING
async function showTravelAdvance(req, res) {
    const rawData = await client.query(`
    SELECT * FROM travel_advance;
    `);
    const cleanData = rawData.rows;
    res.status(200).json({ data: cleanData });
};

async function showListTravelAdvance(req, res) {
    const travel_id = req.params.id
    try {
        const listTravelAdvance = await client.query(`
        SELECT name, role, destination, purpose, date_depart, date_return, carrier, routing, budget, grand_total_costs
        FROM travel_advance
        WHERE travel_id = $1
    `, [travel_id]);

        const listTravelAdvanceDetail = await client.query(`
        SELECT days_duration, transport_advance, lodging_advance, communication_advance, other_advance, perdiem_request
        FROM travel_advance_detail
        WHERE travel_id = $1
    `, [travel_id]);

        const travelAdvance = listTravelAdvance.rows[0];
        const travelAdvanceDetail = listTravelAdvanceDetail.rows[0];

        const gabungData = { ...travelAdvance, ...travelAdvanceDetail };

        if (!travelAdvance || !travelAdvanceDetail) {
            return res.status(404).json({ error: `Data dengan ID ${id} tidak tersedia.` });
        };
        res.status(200).json(gabungData);
    } catch (error) {
        console.log("Error:", error.message)
        res.status(500).json('Internal Server Error');
    }
};

async function createTravelAdvance(req, res) {
    await client.query('BEGIN');
    try {
        const payload = req.body;
        const { rows } = await client.query(`
            INSERT INTO travel_advance (
                name, 
                role, 
                destination, 
                purpose, 
                date_depart, 
                date_return, 
                carrier, 
                routing, 
                budget,
                grand_total_costs
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING travel_id
        `, [payload.name,
            payload.role,
            payload.destination,
            payload.purpose,
            payload.date_depart,
            payload.date_return,
            payload.carrier,
            payload.routing,
            payload.budget,
            payload.grand_total_costs
        ]);

        const new_travel_id = rows[0].travel_id;

        await client.query(`
            INSERT INTO travel_advance_detail (
                travel_id, 
                days_duration, 
                transport_advance, 
                lodging_advance, 
                communication_advance, 
                other_advance,
                perdiem_request
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            new_travel_id, 
            payload.days_duration, 
            payload.transport_advance, 
            payload.lodging_advance, 
            payload.communication_advance,
            payload.other_advance,
            payload.perdiem_request
        ]);

        await client.query('COMMIT');

        res.status(201).json({
            status: "Berhasil dibuat !",
            data: { id: new_travel_id, ...payload }
        })
    } catch (error) {
        await client.query('ROLLBACK');
        console.log("Error:", error.message)
        res.status(500).json('Internal Server Error');
    }
};

async function updateTravelAdvance(req, res) {
    await client.query('BEGIN');
    try {
        const payload = req.body;
        const travel_id = req.params.id;

        const { rows: travelAdvance } = await client.query(`
            SELECT 
                name, 
                role, 
                destination, 
                purpose, 
                date_depart, 
                date_return, 
                carrier, 
                routing, 
                budget,
                grand_total_costs
            FROM travel_advance
            WHERE travel_id = $1
        `, [travel_id]);

        if (travelAdvance.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: `Data dengan ID ${id} tidak tersedia.` });
        };

        const { rows: travelAdvanceDetail } = await client.query(`
        SELECT days_duration, transport_advance, lodging_advance, communication_advance, other_advance, perdiem_request
            FROM travel_advance_detail
            WHERE travel_id = $1
        `, [travel_id]);

        const gabungData = { ...travelAdvance[0], ...travelAdvanceDetail[0], ...payload };

        const updateData = await client.query(`
        UPDATE travel_advance
        SET 
            name = $1, 
            role = $2, 
            destination = $3, 
            purpose = $4, 
            date_depart = $5, 
            date_return = $6, 
            carrier = $7, 
            routing = $8, 
            budget = $9,
            grand_total_costs = $10
        WHERE travel_id = $11
        RETURNING *
        `, [
            gabungData.name,
            gabungData.role,
            gabungData.destination,
            gabungData.purpose,
            gabungData.date_depart,
            gabungData.date_return,
            gabungData.carrier,
            gabungData.routing,
            gabungData.budget,
            gabungData.grand_total_costs,
            travel_id
        ]);

        await client.query(`
        UPDATE travel_advance_detail
        SET 
            days_duration = $1,
            transport_advance = $2,
            lodging_advance = $3,
            communication_advance = $4,
            other_advance = $5,
            perdiem_request = $6
        WHERE travel_id = $7
        RETURNING *
        `, [
            gabungData.days_duration,
            gabungData.transport_advance,
            gabungData.lodging_advance,
            gabungData.communication_advance,
            gabungData.other_advance,
            gabungData.perdiem_request,
            travel_id
        ]);

        await client.query('COMMIT');
        res.status(200).json({
            status: "Update Berhasil !",
            data: updateData.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.log("Error:", error.message)
        res.status(500).json('Internal Server Error');
    }
};

async function deleteTravelAdvance(req, res) {
    await client.query('BEGIN');
    try {
        const travel_id = req.params.id;
        const { rowCount: rowsDeletedAdvance } = await client.query(`
            DELETE FROM travel_advance
            WHERE travel_id = $1
         `, [travel_id]);
        const { rowCount: rowsDeletedDetail } = await client.query(`
            DELETE FROM travel_advance_detail
            WHERE travel_id = $1
         `, [travel_id]);
        await client.query('COMMIT');
        if (rowsDeletedAdvance === 0 || rowsDeletedDetail === 0) {
            return res.status(404).json({ error: `Data dengan ID ${travel_id} tidak tersedia.` });
        }
        res.status(200).json({ delete: `Data dengan ID ${travel_id} sudah terhapus.` });
    } catch (error) {
        await client.query('ROLLBACK');
        console.log("Error:", error.message)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    showTravelAdvance,
    showListTravelAdvance,
    createTravelAdvance,
    updateTravelAdvance,
    deleteTravelAdvance
};

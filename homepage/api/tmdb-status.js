const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
    connectionString: process.env.COCKROACHDB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

// Get TMDB database update status
async function getTMDBStatus(req, res) {
    try {
        // Check if we have a status record in the database
        const result = await pool.query(
            'SELECT * FROM tmdb_update_status ORDER BY last_update DESC LIMIT 1'
        );
        
        if (result.rows.length > 0) {
            const status = result.rows[0];
            res.json({
                lastUpdate: status.last_update,
                nextUpdate: status.next_update,
                moviesCount: status.movies_count || 0,
                status: status.status || 'unknown'
            });
        } else {
            // No status record found, create initial status
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(2, 0, 0, 0); // Set to 2 AM tomorrow
            
            await pool.query(
                `INSERT INTO tmdb_update_status (last_update, next_update, status, movies_count) 
                 VALUES ($1, $2, $3, $4)`,
                [now.toISOString(), tomorrow.toISOString(), 'pending', 0]
            );
            
            res.json({
                lastUpdate: null,
                nextUpdate: tomorrow.toISOString(),
                moviesCount: 0,
                status: 'pending'
            });
        }
        
    } catch (error) {
        console.error('Error getting TMDB status:', error);
        res.status(500).json({ error: 'Failed to get TMDB status' });
    }
}

// Update TMDB database status (called after daily update)
async function updateTMDBStatus(req, res) {
    try {
        const { moviesCount, status = 'completed' } = req.body;
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(2, 0, 0, 0); // Set to 2 AM tomorrow
        
        await pool.query(
            `INSERT INTO tmdb_update_status (last_update, next_update, status, movies_count) 
             VALUES ($1, $2, $3, $4)`,
            [now.toISOString(), tomorrow.toISOString(), status, moviesCount || 0]
        );
        
        res.json({
            success: true,
            message: 'TMDB status updated successfully',
            lastUpdate: now.toISOString(),
            nextUpdate: tomorrow.toISOString()
        });
        
    } catch (error) {
        console.error('Error updating TMDB status:', error);
        res.status(500).json({ error: 'Failed to update TMDB status' });
    }
}

// Check if daily update is needed
async function checkDailyUpdate(req, res) {
    try {
        const result = await pool.query(
            'SELECT * FROM tmdb_update_status ORDER BY last_update DESC LIMIT 1'
        );
        
        if (result.rows.length === 0) {
            return res.json({ needsUpdate: true, reason: 'No previous update found' });
        }
        
        const lastUpdate = new Date(result.rows[0].last_update);
        const now = new Date();
        const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
        
        // Update needed if more than 24 hours have passed
        const needsUpdate = hoursSinceUpdate >= 24;
        
        res.json({
            needsUpdate,
            lastUpdate: result.rows[0].last_update,
            hoursSinceUpdate: Math.round(hoursSinceUpdate),
            reason: needsUpdate ? 'More than 24 hours since last update' : 'Update not needed yet'
        });
        
    } catch (error) {
        console.error('Error checking daily update:', error);
        res.status(500).json({ error: 'Failed to check daily update status' });
    }
}

module.exports = {
    getTMDBStatus,
    updateTMDBStatus,
    checkDailyUpdate
};

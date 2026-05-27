const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const limit = parseInt(req.query.limit) || 50;

    const { data, error } = await supabase
      .from('calls')
      .select('id, call_id, created_at, student_name, phone_number, duration_seconds, status, ended_reason, transcript, recording_url, sentiment, summary, cost')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ calls: data || [] });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

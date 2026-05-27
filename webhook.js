const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-vapi-secret');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const event = req.body;
    const type = event?.message?.type;

    console.log('Vapi webhook event:', type);

    // Only process end-of-call report
    if (type !== 'end-of-call-report') {
      return res.status(200).json({ received: true, type });
    }

    const msg = event.message;
    const call = msg.call || {};
    const artifact = msg.artifact || {};

    // Extract transcript as readable text
    let transcriptText = '';
    if (artifact.transcript) {
      transcriptText = artifact.transcript;
    } else if (artifact.messages && Array.isArray(artifact.messages)) {
      transcriptText = artifact.messages
        .filter(m => m.role && m.content)
        .map(m => `${m.role === 'assistant' ? 'Siya' : 'Student'}: ${m.content}`)
        .join('\n');
    }

    // Extract student name from variable values
    const vars = call.assistantOverrides?.variableValues || {};
    const studentName = vars.firstname || call.customer?.name || null;
    const phoneNumber = call.customer?.number || null;

    // Sentiment from analysis
    const analysis = msg.analysis || {};
    const sentiment = analysis.successEvaluation || null;
    const summary = analysis.summary || null;

    const record = {
      call_id: call.id || null,
      student_name: studentName,
      phone_number: phoneNumber,
      duration_seconds: msg.durationSeconds || null,
      status: call.status || 'ended',
      ended_reason: msg.endedReason || null,
      transcript: transcriptText || null,
      recording_url: artifact.recordingUrl || null,
      sentiment: sentiment,
      summary: summary,
      cost: msg.cost || null,
      raw: event
    };

    const { data, error } = await supabase
      .from('calls')
      .upsert(record, { onConflict: 'call_id' })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Call saved:', data?.[0]?.id);
    return res.status(200).json({ success: true, id: data?.[0]?.id });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: err.message });
  }
};

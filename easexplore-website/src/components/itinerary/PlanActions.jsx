import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';
import { withSetupHint } from '@/services/dbErrors';
import { saveItinerary } from '@/services/itineraries';
import { defaultTitle, planToText, summarizePlan } from '@/utils/itinerary';

/**
 * Save (needs a login), share on WhatsApp, copy as text, and print.
 * `onSaved` is called after a successful save so the saved list can refresh.
 */
export default function PlanActions({ plan, dayNumber, inputs, onSaved }) {
  const { user, isConfigured } = useAuth();
  const location = useLocation();
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { tone, text }

  const placeholder = defaultTitle(inputs);
  const text = planToText(plan, dayNumber, `EaseXplore: ${title.trim() || placeholder}`);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await saveItinerary({
        title: title.trim() || placeholder,
        inputs,
        summary: summarizePlan(plan),
      });
      setMessage({ tone: 'success', text: 'Plan saved to your account.' });
      setTitle('');
      onSaved?.();
    } catch (error) {
      setMessage({ tone: 'error', text: withSetupHint(error.message, { file: '001_itineraries.sql', part: 'Part 6' }) });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ tone: 'success', text: 'Plan copied. You can paste it anywhere.' });
    } catch {
      setMessage({ tone: 'error', text: 'Could not copy automatically. Try the WhatsApp or Print buttons instead.' });
    }
  };

  let saveArea;
  if (!isConfigured) {
    saveArea = (
      <Alert tone="info">Saving plans is not switched on yet. You can still copy, share or print this plan.</Alert>
    );
  } else if (!user) {
    saveArea = (
      <Button to={ROUTES.login.path} state={{ from: location }} icon="login" fullWidth>
        Log in to save this plan
      </Button>
    );
  } else {
    saveArea = (
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <TextField
          label="Plan name"
          placeholder={placeholder}
          maxLength={80}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
        />
        <Button type="submit" icon="bookmark_add" loading={saving} fullWidth>
          Save plan
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4 print:hidden">
      {saveArea}
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <Button
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="tonal"
          size="sm"
          icon="chat"
        >
          WhatsApp
        </Button>
        <Button variant="tonal" size="sm" icon="content_copy" onClick={handleCopy}>
          Copy
        </Button>
        <Button variant="tonal" size="sm" icon="print" onClick={() => window.print()}>
          Print
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import TextField from '@/components/ui/TextField';

/** Password input with a show/hide toggle. Accepts the same props as TextField. */
export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} size={20} />
        </button>
      }
    />
  );
}

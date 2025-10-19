import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface WelcomeMessageSectionProps {
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  welcomeMessageId: string;
}

const SUPPORTED_WELCOME_VARIABLES = [
  '{user}',
  '{hubName}',
  '{serverName}',
  '{memberCount}',
  '{totalConnections}',
];

export function WelcomeMessageSection({
  welcomeMessage,
  setWelcomeMessage,
  welcomeMessageId,
}: WelcomeMessageSectionProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor={welcomeMessageId} className="font-medium text-base">
        Welcome Message
      </Label>
      <Textarea
        id={welcomeMessageId}
        placeholder="Write a welcome message for new servers..."
        value={welcomeMessage}
        onChange={(e) => setWelcomeMessage(e.target.value)}
        maxLength={1000}
        className="min-h-[100px] resize-none border-gray-700/50 bg-gray-800/50 focus-visible:ring-indigo-500/50"
      />
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-gray-400 text-xs">
            This message will be shown to <b>all servers</b> when a new server
            joins your hub.
          </p>
          <span className="text-gray-400 text-xs">
            {welcomeMessage.length}/1000
          </span>
        </div>
        <div className="text-gray-400 text-xs">
          <p className="mb-2">You can use these variables:</p>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_WELCOME_VARIABLES.map((variable) => (
              <button
                key={variable}
                type="button"
                className="inline-block cursor-pointer rounded border-0 bg-indigo-500/20 px-2 py-1 font-mono text-indigo-300 text-sm transition-colors hover:bg-indigo-500/30"
                onClick={() => setWelcomeMessage(welcomeMessage + variable)}
                aria-label={`Insert variable ${variable}`}
              >
                {variable}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

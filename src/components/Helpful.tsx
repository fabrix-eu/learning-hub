import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { sendFeedback } from '../lib/directus';

export function Helpful({ topicId }: { topicId: string }) {
  const [answered, setAnswered] = useState(false);
  const { mutate, isError } = useMutation({
    mutationFn: (helpful: boolean) => sendFeedback(topicId, helpful),
    onSuccess: () => setAnswered(true),
  });

  if (answered) {
    return (
      <p className="mt-10 rounded-fx border border-line bg-card px-4 py-3.5 text-body text-ink2">
        Thanks — that helps us decide what to write next.
      </p>
    );
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-2.5 rounded-fx border border-line bg-card px-4 py-3.5">
      <span className="text-body font-bold text-ink">Was this helpful?</span>
      <button
        type="button"
        onClick={() => mutate(true)}
        className="flex items-center gap-1.5 rounded-fx-action border border-line2 px-3.5 py-1.5 text-small font-bold transition hover:border-green hover:text-green"
      >
        <ThumbsUp className="size-3.5" />
        Yes
      </button>
      <button
        type="button"
        onClick={() => mutate(false)}
        className="flex items-center gap-1.5 rounded-fx-action border border-line2 px-3.5 py-1.5 text-small font-bold transition hover:border-ink hover:text-ink"
      >
        <ThumbsDown className="size-3.5" />
        No
      </button>
      {isError && <span className="text-small text-muted">Couldn't send that — try again in a moment.</span>}
    </div>
  );
}

import { sileo, Toaster } from 'sileo';

export function SileoNotification({ titleClassName, descriptionClassName }) {
  return (
    <Toaster
      position="top-center"
      theme="light"
      options={{
        fill: '#0f172a',
        roundness: 14,
        styles: {
          title: titleClassName,
          description: descriptionClassName,
        },
      }}
    />
  );
}

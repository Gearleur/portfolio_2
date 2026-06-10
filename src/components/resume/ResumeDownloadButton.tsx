import type { ResumeDownload } from '../../data/resume';

type ResumeDownloadButtonProps = {
  className: string;
  download: ResumeDownload;
  children: React.ReactNode;
};

export function ResumeDownloadButton({
  className,
  download,
  children,
}: ResumeDownloadButtonProps) {
  if (!download.href) {
    return (
      <button className={className} type="button" disabled>
        {children}
      </button>
    );
  }

  return (
    <a className={className} href={download.href} download={download.fileName}>
      {children}
    </a>
  );
}

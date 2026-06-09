import { DesktopButtonIcon } from '../desktop/DesktopIcon';

export function EducationIcon({ onOpen }: { onOpen: () => void }) {
  return (
    <DesktopButtonIcon
      className="education-file"
      iconSrc="/assets/icons/desktop/education.ico"
      label="Education"
      onClick={onOpen}
    />
  );
}

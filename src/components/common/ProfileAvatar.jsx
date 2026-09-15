import { cn } from '../../utils/cn';
import { getProfileDisplayName, getProfileInitial, getProfilePhotoURL } from '../../utils/profileDisplay';

const SIZE_CLASSES = {
  xs: 'size-7 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-12 text-base',
  lg: 'size-14 text-xl',
  xl: 'size-20 text-2xl',
};

export default function ProfileAvatar({
  profile,
  user,
  name,
  photoURL: photoProp,
  size = 'md',
  rounded = 'full',
  className,
}) {
  const displayName = name ?? getProfileDisplayName(profile, user);
  const initial = name ? name.slice(0, 1).toUpperCase() : getProfileInitial(profile, user);
  const photoURL = photoProp ?? getProfilePhotoURL(profile, user);
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const roundedClass = rounded === '2xl' ? 'rounded-2xl' : 'rounded-full';

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={displayName}
        className={cn(
          sizeClass,
          roundedClass,
          'shrink-0 object-cover border border-slate-200 dark:border-slate-700',
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        roundedClass,
        'grid shrink-0 place-items-center bg-brand-100 font-bold text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
        className,
      )}
    >
      {initial}
    </div>
  );
}

import type { LazyBeforeUnveilEvent } from 'lazysizes/types/global'

document.addEventListener('lazybeforeunveil', (e: LazyBeforeUnveilEvent) => {
  const el = e.target

  const picture: Element | null = el.closest('.picture')

  if (picture && picture.classList.contains('picture--loading')) {
    picture.classList.remove('picture--loading')
  }
})

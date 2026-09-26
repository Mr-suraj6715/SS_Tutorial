export interface PageSEO {
  title: string
  description?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  canonicalUrl?: string
}

export function updatePageMeta(seo: PageSEO, instituteName: string = 'SS Tutorial') {
  if (typeof document === 'undefined') return

  const fullTitle = seo.title.includes(instituteName)
    ? seo.title
    : `${seo.title} | ${instituteName}`

  document.title = fullTitle

  // Update or set meta description
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.setAttribute('name', 'description')
    document.head.appendChild(metaDesc)
  }
  metaDesc.setAttribute('content', seo.description || `Official website of ${instituteName}`)

  // Update OpenGraph tags
  const setMetaProperty = (property: string, content: string) => {
    let tag = document.querySelector(`meta[property="${property}"]`)
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('property', property)
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', content)
  }

  setMetaProperty('og:title', fullTitle)
  setMetaProperty('og:description', seo.description || `Official website of ${instituteName}`)
  setMetaProperty('og:type', seo.ogType || 'website')
  if (seo.ogImage) {
    setMetaProperty('og:image', seo.ogImage)
  }
}

import api from './axios'

export const getPresignedDownloadUrls = async (keys) => {
  const response = await api.post('/uploads/presign-download-url', { keys })

  // Assuming API returns { urls: [{ key, url }, ...] }
  if (Array.isArray(keys)) {
    return response.data.urls
  } else {
    return response.data.url
  }
}

export const downloadDocumentThroughProxy = async (source, options = {}) => {
  const response = await api.post(
    '/uploads/proxy-download',
    {
      source,
      downloadName: options.downloadName,
      disposition: options.disposition || 'attachment',
      contentType: options.contentType,
    },
    {
      responseType: 'blob',
      timeout: 120000,
    },
  )

  return response.data
}

export const openDocumentInNewTab = async (source, options = {}) => {
  const tab = window.open('', '_blank', 'noopener,noreferrer')
  try {
    const blob = await downloadDocumentThroughProxy(source, {
      downloadName: options.downloadName,
      disposition: 'inline',
      contentType: options.contentType,
    })

    const objectUrl = URL.createObjectURL(blob)

    if (tab) {
      tab.location.href = objectUrl
    } else {
      const link = document.createElement('a')
      link.href = objectUrl
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
  } catch (error) {
    if (tab) {
      tab.close()
    }
    throw error
  }
}

/**
 * Excel export utility functions
 */

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions { key, title }
 * @param {string} fileName - File name without extension
 */
export function exportToExcel(data, columns, fileName = 'export') {
  try {
    // Create CSV content
    const csvContent = createCSVContent(data, columns)

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${fileName}_${formatDate(new Date())}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Export to Excel error:', error)
    throw new Error('Failed to export data to Excel')
  }
}

/**
 * Create CSV content from data and columns
 * @param {Array} data - Data to convert
 * @param {Array} columns - Column definitions
 * @returns {string} CSV content
 */
function createCSVContent(data, columns) {
  // Create header row
  const headers = columns.map(col => escapeCsvValue(col.title)).join(',')

  // Create data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key]
      return escapeCsvValue(value)
    }).join(',')
  })

  return [headers, ...rows].join('\n')
}

/**
 * Escape CSV value for proper formatting
 * @param {any} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Format date for file name
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}${month}${day}_${hours}${minutes}`
}

/**
 * Export data to JSON file
 * @param {Array} data - Data to export
 * @param {string} fileName - File name without extension
 */
export function exportToJSON(data, fileName = 'export') {
  try {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${fileName}_${formatDate(new Date())}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Export to JSON error:', error)
    throw new Error('Failed to export data to JSON')
  }
}

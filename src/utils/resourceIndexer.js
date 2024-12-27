import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const RESOURCE_BASE_PATH = path.resolve(process.cwd(), 'resources')

export function indexResources() {
  const resourceIndex = {}
  
  function traverseDirectory(dir) {
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const fullPath = path.join(dir, file)
      const stats = fs.statSync(fullPath)
      
      if (stats.isDirectory()) {
        traverseDirectory(fullPath)
      } else if (file.endsWith('.md')) {
        try {
          const fileContent = fs.readFileSync(fullPath, 'utf8')
          const { data, content } = matter(fileContent)
          
          const resourceKey = path.relative(RESOURCE_BASE_PATH, fullPath)
          
          resourceIndex[resourceKey] = {
            id: resourceKey,
            title: data.title || path.basename(file, '.md'),
            categoryId: path.basename(path.dirname(fullPath)),
            tags: data.tags || [],
            difficulty: data.difficulty || 'beginner',
            description: data.description || content.slice(0, 200),
            lastUpdated: stats.mtime,
            fullPath: fullPath
          }
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error)
        }
      }
    })
  }
  
  traverseDirectory(RESOURCE_BASE_PATH)
  return resourceIndex
}

export async function getResourceContent(resourcePath) {
  try {
    const fullPath = path.join(RESOURCE_BASE_PATH, resourcePath)
    const fileContent = await fs.promises.readFile(fullPath, 'utf8')
    const { data, content } = matter(fileContent)
    
    return {
      metadata: data,
      content: content
    }
  } catch (error) {
    console.error(`Error reading resource ${resourcePath}:`, error)
    return null
  }
}

export function searchResources(query) {
  const resources = indexResources()
  const lowercaseQuery = query.toLowerCase()
  
  return Object.values(resources).filter(resource => 
    resource.title.toLowerCase().includes(lowercaseQuery) ||
    resource.description.toLowerCase().includes(lowercaseQuery) ||
    resource.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export function getResourcesByCategory(categoryId) {
  const resources = indexResources()
  return Object.values(resources).filter(resource => 
    resource.categoryId === categoryId
  )
}

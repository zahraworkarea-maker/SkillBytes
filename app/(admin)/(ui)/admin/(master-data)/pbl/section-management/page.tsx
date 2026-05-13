'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Plus, Search, ChevronDown, ChevronRight } from 'lucide-react'
import { PBLSectionForm, PBLSectionItemForm, type PBLSectionFormData, type PBLSectionItemFormData } from '@/components/pbl'
import { toast } from 'react-toastify'

interface SectionItem {
  id: string
  type: 'text' | 'image' | 'video' | 'file'
  content?: string
  imageUrl?: string
  order: number
}

interface Section extends PBLSectionFormData {
  id: string
  items: SectionItem[]
}

export default function PBLSectionManagementPage() {
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'section-1',
      title: 'Pendahuluan',
      description: 'Pengenalan masalah sistem login',
      order: 1,
      items: [
        { id: 'item-1', type: 'text', content: 'Deskripsi masalah...', order: 1 },
      ],
    },
  ])

  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [editingItem, setEditingItem] = useState<SectionItem | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null)
  const [globalFilter, setGlobalFilter] = useState('')

  const handleAddSection = () => {
    setEditingSection(null)
    setIsSectionDialogOpen(true)
  }

  const handleEditSection = (section: Section) => {
    setEditingSection(section)
    setIsSectionDialogOpen(true)
  }

  const handleSubmitSection = async (data: PBLSectionFormData) => {
    if (editingSection) {
      setSections(
        sections.map((s) =>
          s.id === editingSection.id
            ? { ...s, ...data }
            : s
        )
      )
      toast.success('Section berhasil diperbarui!')
    } else {
      const newSection: Section = {
        id: `section-${Date.now()}`,
        title: data.title,
        description: data.description,
        order: data.order || sections.length + 1,
        items: [],
      }
      setSections([...sections, newSection])
      toast.success('Section berhasil ditambahkan!')
    }
  }

  const handleDeleteSection = async (id: string) => {
    const confirmed = window.confirm(
      'Apakah Anda yakin ingin menghapus section ini beserta semua itemnya?'
    )
    if (confirmed) {
      setSections(sections.filter((s) => s.id !== id))
      toast.success('Section berhasil dihapus!')
    }
  }

  const handleAddItem = (sectionId: string) => {
    setSelectedSectionId(sectionId)
    setEditingItem(null)
    setIsItemDialogOpen(true)
  }

  const handleEditItem = (sectionId: string, item: SectionItem) => {
    setSelectedSectionId(sectionId)
    setEditingItem(item)
    setIsItemDialogOpen(true)
  }

  const handleSubmitItem = async (data: PBLSectionItemFormData) => {
    if (!selectedSectionId) return

    setSections(
      sections.map((section) => {
        if (section.id === selectedSectionId) {
          if (editingItem) {
            return {
              ...section,
              items: section.items.map((item) =>
                item.id === editingItem.id
                  ? {
                      ...item,
                      type: data.type,
                      content: data.content,
                      imageUrl: data.imageUrl,
                      order: data.order || item.order,
                    }
                  : item
              ),
            }
          } else {
            return {
              ...section,
              items: [
                ...section.items,
                {
                  id: `item-${Date.now()}`,
                  type: data.type,
                  content: data.content,
                  imageUrl: data.imageUrl,
                  order: data.order || section.items.length + 1,
                },
              ],
            }
          }
        }
        return section
      })
    )
    toast.success(editingItem ? 'Item berhasil diperbarui!' : 'Item berhasil ditambahkan!')
  }

  const handleDeleteItem = async (sectionId: string, itemId: string) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus item ini?')
    if (confirmed) {
      setSections(
        sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                items: section.items.filter((item) => item.id !== itemId),
              }
            : section
        )
      )
      toast.success('Item berhasil dihapus!')
    }
  }

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
      section.description
        ?.toLowerCase()
        .includes(globalFilter.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 bg-linear-to-br from-blue-50 via-white to-blue-25 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Kelola Section & Item PBL
        </h1>
        <Button
          onClick={handleAddSection}
          className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="mr-2 h-5 w-5" />
          Tambah Section
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
        <Input
          placeholder="Cari section..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-sm"
        />
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => (
            <div
              key={section.id}
              className="border-2 border-blue-200 rounded-xl overflow-hidden shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Section Header */}
              <div className="bg-linear-to-r from-blue-50 to-blue-25 p-4 flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedSectionId(
                    expandedSectionId === section.id ? null : section.id
                  )
                }
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedSectionId(
                        expandedSectionId === section.id ? null : section.id
                      )
                    }}
                  >
                    {expandedSectionId === section.id ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {section.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {section.items.length} item
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditSection(section)
                    }}
                    className="border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSection(section.id)
                    }}
                    className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {expandedSectionId === section.id && (
                <div className="border-t-2 border-blue-200 p-4 bg-white">
                  {section.items.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {section.items
                        .sort((a, b) => a.order - b.order)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {item.type === 'text' && '📝 Teks'}
                                {item.type === 'image' && '🖼️ Gambar'}
                                {item.type === 'video' && '▶️ Video'}
                                {item.type === 'file' && '📄 File'}
                              </p>
                              {item.content && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {item.content}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEditItem(section.id, item)
                                }
                                className="border-blue-300 hover:bg-blue-50 text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteItem(section.id, item.id)
                                }
                                className="border-red-300 hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      Belum ada item
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                    onClick={() => handleAddItem(section.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Item
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-blue-200 rounded-xl bg-white/50">
            <Search className="h-12 w-12 text-blue-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Belum ada section</p>
            <p className="text-gray-500 text-sm">Mulai dengan menambahkan section baru</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <PBLSectionForm
        isOpen={isSectionDialogOpen}
        onOpenChange={setIsSectionDialogOpen}
        initialData={editingSection}
        onSubmit={handleSubmitSection}
      />

      <PBLSectionItemForm
        isOpen={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        initialData={editingItem}
        onSubmit={handleSubmitItem}
      />
    </div>
  )
}

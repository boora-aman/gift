<template>
  <div class="min-h-full bg-desert-sand-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-pulse text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-4"></div>
        <div class="h-4 bg-charcoal-200 rounded w-32 mx-auto mb-2"></div>
        <div class="h-3 bg-charcoal-200 rounded w-24 mx-auto"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-charcoal-900 mb-2">Gift Not Found</h3>
        <p class="text-charcoal-600 mb-4">{{ error }}</p>
        <button
          @click="$router.go(-1)"
          class="inline-flex items-center px-4 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
        >
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          Go Back
        </button>
      </div>
    </div>

    <!-- Gift Detail Content -->
    <div v-else>
      <!-- Header with Back Button and Mobile Menu -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div class="flex items-center justify-between">
          <button
            @click="goBack"
            class="inline-flex items-center px-3 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            Back to Gifts
          </button>

          <!-- Mobile Menu (3-dot menu) -->
          <div class="lg:hidden relative" ref="mobileMenuRef">
            <button
              @click="showMobileMenu = !showMobileMenu"
              class="inline-flex items-center p-2 border border-charcoal-300 rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              aria-expanded="false"
              aria-haspopup="true"
            >
              <EllipsisVerticalIcon class="w-5 h-5" />
            </button>

            <!-- Mobile Dropdown Menu -->
            <div
              v-if="showMobileMenu"
              class="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
              role="menu"
              aria-orientation="vertical"
            >
              <div class="py-1" role="none">
                <button
                  v-if="authStore.canDispatchGifts"
                  @click.prevent="handleIssueGift"
                  class="flex items-center w-full px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  role="menuitem"
                >
                  <GiftIcon class="w-4 h-4 mr-3 text-gray-700" />
                  Dispatch this Gift
                </button>

                <button
                  v-if="gift.status === 'Issued'"
                  @click.prevent="() => { showMobileMenu = false; showAddInterest = true; }"
                  class="flex items-center w-full px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  role="menuitem"
                >
                  <StarIcon class="w-4 h-4 mr-3 text-charcoal-600" />
                  Add Interest
                </button>

                <button
                  v-if="authStore.canEditGifts"
                  @click.prevent="handleEditGift"
                  class="flex items-center w-full px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  role="menuitem"
                >
                  <PencilIcon class="w-4 h-4 mr-3 text-charcoal-600" />
                  Edit Gift
                </button>

                <hr class="my-1 border-charcoal-200" />

                <!-- Only Admin can update barcode -->
                <button
                  v-if="authStore.isAdmin"
                  @click.prevent="handleGenerateBarcode"
                  class="flex items-center w-full px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  role="menuitem"
                >
                  <ArrowPathIcon class="w-4 h-4 mr-3 text-charcoal-600" />
                  Update Barcode
                </button>

                <button
                  v-if="gift.barcode"
                  @click.prevent="handleDownloadBarcode"
                  class="flex items-center w-full px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  role="menuitem"
                >
                  <ArrowDownTrayIcon class="w-4 h-4 mr-3 text-charcoal-600" />
                  Download Barcode
                </button>

                <button
                  @click.prevent="handlePrintBarcode"
                  class="flex items-center w-full px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  role="menuitem"
                >
                  <PrinterIcon class="w-4 h-4 mr-3 text-charcoal-600" />
                  Print Barcode
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-safe-navbar">
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <!-- Main Content - Takes up 3 columns on XL screens -->
          <div class="xl:col-span-3 space-y-6">
            <!-- Gift Information Cards in Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Basic Info Card -->
              <div class="bg-white rounded-xl shadow-card p-6">
                <div class="flex items-center mb-4">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <GiftIcon class="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 class="text-lg font-semibold text-charcoal-900">Gift Information</h2>
                </div>

                <div class="gap-4 grid grid-cols-2">
                  <div>
                    <label class="block text-sm font-medium text-charcoal-600 mb-1">Gift Name</label>
                    <p class="text-charcoal-900 font-medium">{{ gift.gift_name }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-charcoal-600 mb-1">UAE Ring (رقم الحلقة)</label>
                    <p class="text-charcoal-900 font-medium font-mono">{{ gift.gift_id }}</p>
                  </div>

                  <div v-if="gift.gender">
                    <label class="block text-sm font-medium text-charcoal-600 mb-1">Gender (الجنس)</label>
                    <p class="text-charcoal-900 font-medium">{{ gift.gender }}</p>
                  </div>

                  <div v-if="gift.breed">
                    <label class="block text-sm font-medium text-charcoal-600 mb-1">Breed (الجبر)</label>
                    <p class="text-charcoal-900 font-medium">{{ gift.breed }}</p>
                  </div>

                  <div v-if="gift.weight">
                    <label class="block text-sm font-medium text-charcoal-600 mb-1">Weight (الوزن)</label>
                    <p class="text-charcoal-900 font-medium">{{ gift.weight }} kg</p>
                  </div>

                  <div v-if="gift.farm_name">
                    <label class="block text-sm font-medium text-charcoal-600 mb-1">Farm Name (المزرعة)</label>
                    <p class="text-charcoal-900 font-medium">{{ gift.farm_name }}</p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-charcoal-600 mb-1">Category (النوع)</label>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {{ formatCategory(gift.category) }}
                    </span>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-charcoal-600 mb-1">Status</label>
                    <div class="flex items-center space-x-3">
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        :class="getStatusClasses(gift.status)"
                      >
                        <span class="w-2 h-2 rounded-full mr-2" :class="getStatusDotClasses(gift.status)"></span>
                        {{ getStatusText(gift.status) }}
                      </span>
                    </div>
                  </div>

                  <div v-if="gift.description" class="pt-2">
                    <label class="block text-sm font-medium text-charcoal-600 mb-2">Description</label>
                    <p class="text-charcoal-700 text-sm leading-relaxed">{{ gift.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Barcode Info Card -->
              <div class="bg-white rounded-xl shadow-card p-6">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <QrCodeIcon class="w-5 h-5 text-green-600" />
                    </div>
                    <h2 class="text-lg font-semibold text-charcoal-900">Barcode</h2>
                  </div>
                  <!-- Only Admin can update barcode -->
                  <button
                    v-if="authStore.isAdmin"
                    @click="openBarcodeModal"
                    class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Update
                  </button>
                </div>

                <div class="space-y-4">
                  <!-- Barcode Image -->
                  <div class="flex justify-center">
                    <div v-if="gift.barcode" class="w-90 h-54 bg-white border-2 border-charcoal-200 rounded-lg p-2 flex items-center justify-center">
                      <img
                        :src="gift.barcode"
                        alt="Barcode"
                        class="w-full h-full object-contain"
                      />
                    </div>
                    <div v-else class="w-48 h-24 bg-charcoal-100 border-2 border-dashed border-charcoal-300 rounded-lg p-2 flex items-center justify-center">
                      <div class="text-center">
                        <QrCodeIcon class="w-8 h-8 text-charcoal-400 mx-auto mb-1" />
                        <p class="text-xs text-charcoal-500">No barcode</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-charcoal-600 mb-1">Barcode ID</label>
                    <div class="flex items-center space-x-2">
                      <code class="flex-1 bg-charcoal-100 px-3 py-2 rounded text-sm font-mono">{{ gift.barcode_value || 'Not generated' }}</code>
                      <button
                        v-if="gift.barcode_value"
                        @click="copyCode"
                        class="p-2 text-charcoal-500 hover:text-charcoal-700 transition-colors rounded"
                        title="Copy barcode ID"
                      >
                        <ClipboardDocumentIcon class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div class="flex space-x-2">
                    <!-- Only Admin can update barcode -->
                    <button
                      v-if="authStore.isAdmin"
                      @click="openBarcodeModal"
                      class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                    >
                      <ArrowPathIcon class="w-4 h-4 mr-2" />
                      Update
                    </button>
                    <button
                      v-if="gift.barcode"
                      @click="downloadBarcode"
                      class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
                    >
                      <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button
                      v-if="gift.barcode"
                      @click="printBarcode"
                      class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
                    >
                      <PrinterIcon class="w-4 h-4 mr-2" />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Attributes Card -->
            <div v-if="gift.additional_attributes && gift.additional_attributes.length > 0" class="bg-white rounded-xl shadow-card p-6">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <TagIcon class="w-5 h-5 text-orange-600" />
                </div>
                <h2 class="text-lg font-semibold text-charcoal-900">Additional Attributes</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="(attr, index) in gift.additional_attributes"
                  :key="index"
                  class="bg-charcoal-50 rounded-lg p-4"
                >
                  <label class="block text-sm font-medium text-charcoal-600 mb-1">{{ attr.attribute_name }}</label>
                  <p class="text-charcoal-900 font-medium">{{ attr.attribute_value }}</p>
                </div>
              </div>
            </div>

            <!-- Gift Images Card -->
            <div v-if="gift.images && gift.images.length > 0" class="bg-white rounded-xl shadow-card p-6">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                  <EyeIcon class="w-5 h-5 text-pink-600" />
                </div>
                <h2 class="text-lg font-semibold text-charcoal-900">Gift Images</h2>
                <span class="ml-2 text-sm text-charcoal-500">({{ gift.images.length }})</span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div
                  v-for="(img, index) in gift.images"
                  :key="index"
                  class="relative group cursor-pointer"
                  @click="openImageModal(img.image)"
                >
                  <div class="aspect-square bg-charcoal-100 rounded-lg overflow-hidden">
                    <AppImage
                      :src="img.image"
                      :alt="`Gift image ${index + 1}`"
                      image-class="w-full h-full object-cover transition-transform group-hover:scale-105"
                      container-class="w-full h-full"
                      placeholder-class="w-full h-full"
                    />
                  </div>
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                    <EyeIcon class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity History Cards -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Dispatch History -->
              <div class="bg-white rounded-xl shadow-card p-6">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <UserIcon class="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 class="text-lg font-semibold text-charcoal-900">Issued To</h2>
                  </div>
                  <span class="text-sm text-charcoal-500">{{ dispatchHistory.length }} record{{ dispatchHistory.length !== 1 ? 's' : '' }}</span>
                </div>

                <div v-if="loadingDispatchHistory" class="text-center py-8">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p class="text-charcoal-600 mt-2 text-sm">Loading...</p>
                </div>

                <div v-else-if="!dispatchHistory.length" class="text-center py-8">
                  <DocumentTextIcon class="w-10 h-10 text-charcoal-400 mx-auto mb-3" />
                  <p class="text-charcoal-600 text-sm">No dispatch records yet</p>
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="(dispatch, index) in dispatchHistory"
                    :key="dispatch.name"
                    class="bg-blue-50 rounded-lg p-4"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="font-medium text-charcoal-900 text-sm">
                          {{ `${dispatch.owner_full_name || ''} ${dispatch.owner_full_name || ''}`.trim() || 'N/A' }}
                        </p>
                        <p class="text-xs text-charcoal-600 mt-1">{{ dispatch.mobile_number || 'N/A' }}</p>
                        <p class="text-xs text-charcoal-600">{{ formatDate(dispatch.date) }}</p>
                      </div>

                      <div class="flex items-center space-x-2">
                        <button
                          v-if="dispatch.person_photo"
                          @click="openPersonModal(dispatch)"
                          class="p-1 text-charcoal-500 hover:text-charcoal-700 transition-colors rounded"
                          title="View person details"
                        >
                          <EyeIcon class="w-4 h-4" />
                        </button>
                        <router-link
                          :to="`/issues/${dispatch.name}`"
                          class="p-1 text-charcoal-500 hover:text-charcoal-700 transition-colors rounded"
                          title="View dispatch details"
                        >
                          <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Gift Interests -->
              <div class="bg-white rounded-xl shadow-card p-6">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <StarIcon class="w-5 h-5 text-yellow-600" />
                    </div>
                    <h2 class="text-lg font-semibold text-charcoal-900">Interested By</h2>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-charcoal-500">{{ interests.length }} interest{{ interests.length !== 1 ? 's' : '' }}</span>
                    <button
                      @click="showAddInterest = true"
                      class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      title="Add new interest"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div v-if="loadingInterests" class="text-center py-8">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p class="text-charcoal-600 mt-2 text-sm">Loading...</p>
                </div>

                <div v-else-if="!interests.length" class="text-center py-8">
                  <StarIcon class="w-10 h-10 text-charcoal-400 mx-auto mb-3" />
                  <p class="text-charcoal-600 text-sm">No interests recorded</p>
                  <button
                    v-if="gift.status === 'Issued'"
                    @click="showAddInterest = true"
                    class="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Add the first interest
                  </button>
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="(interest, index) in interests"
                    :key="interest.name"
                    class="bg-yellow-50 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors"
                    @click="openInterestPersonModal(interest)"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="font-medium text-charcoal-900 text-sm">
                          {{ `${interest.owner_full_name || ''}`.trim() || 'N/A' }}
                        </p>
                        <p class="text-xs text-charcoal-600 mt-1">{{ interest.mobile_number || 'N/A' }}</p>
                        <div class="text-xs text-charcoal-600 mt-1 space-y-1">
                          <p>{{ formatDateTime(interest.creation) }}</p>
                          <p v-if="interest.created_by_name" class="text-charcoal-500">
                            Created by: {{ interest.created_by_name }}
                          </p>
                        </div>
                      </div>
                      <div class="flex flex-col items-end space-y-2">
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                          Interested
                        </span>
                        <button
                          @click.stop="dispatchToSpecificInterest(interest)"
                          class="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          title="Dispatch this gift"
                        >
                          Dispatch
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar - Takes up 1 column on XL screens -->
          <div class="xl:col-span-1 space-y-6">
            <!-- Quick Actions Card -->
            <div class="bg-white rounded-xl shadow-card p-6">
              <h3 class="text-lg font-semibold text-charcoal-900 mb-4">Quick Actions</h3>

              <div class="space-y-3">
                <button
                  v-if="authStore.canDispatchGifts"
                  @click="issueGift"
                  class="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  <GiftIcon class="w-4 h-4 mr-2" />
                  Dispatch Gift
                </button>

                <button
                  v-if="gift.status === 'Issued'"
                  @click="showAddInterest = true"
                  class="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  <StarIcon class="w-4 h-4 mr-2" />
                  Add Interest
                </button>

                <button
                  v-if="authStore.canEditGifts"
                  @click="editGift"
                  class="w-full inline-flex items-center justify-center px-4 py-3 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
                >
                  <PencilIcon class="w-4 h-4 mr-2" />
                  Edit Gift
                </button>


              </div>
            </div>

            <!-- Gift Metadata Card -->
            <div class="bg-white rounded-xl shadow-card p-6">
              <h3 class="text-lg font-semibold text-charcoal-900 mb-4">Metadata</h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-charcoal-600 mb-1">Created</label>
                  <p class="text-sm text-charcoal-900">{{ formatDate(gift.creation) }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-charcoal-600 mb-1">Modified</label>
                  <p class="text-sm text-charcoal-900">{{ formatDate(gift.modified) }}</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-charcoal-600 mb-1">Created by</label>
                  <p class="text-sm text-charcoal-900">{{ gift.owner || 'System' }}</p>
                </div>

                <div v-if="gift.docstatus">
                  <label class="block text-sm font-medium text-charcoal-600 mb-1">Document Status</label>
                  <p class="text-sm text-charcoal-900">{{ getDocStatus(gift.docstatus) }}</p>
                </div>
              </div>
            </div>

            <!-- Statistics Card -->
            <div class="bg-white rounded-xl shadow-card p-6">
              <h3 class="text-lg font-semibold text-charcoal-900 mb-4">Statistics</h3>

              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-charcoal-600">Total Dispatches</span>
                  <span class="text-lg font-semibold text-charcoal-900">{{ dispatchHistory.length }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-charcoal-600">Total Interests</span>
                  <span class="text-lg font-semibold text-charcoal-900">{{ interests.length }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-charcoal-600">Images</span>
                  <span class="text-lg font-semibold text-charcoal-900">{{ gift.images?.length || 0 }}</span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-sm text-charcoal-600">Attributes</span>
                  <span class="text-lg font-semibold text-charcoal-900">{{ gift.additional_attributes?.length || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div
          class="fixed inset-0 transition-opacity"
          aria-hidden="true"
          @click="closeImageModal"
        >
          <div class="absolute inset-0 bg-charcoal-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-charcoal-900">
                Gift Image
              </h3>
              <button
                @click="closeImageModal"
                class="text-charcoal-400 hover:text-charcoal-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="flex justify-center">
              <AppImage
                :src="selectedImage"
                alt="Gift Image"
                image-class="max-w-full max-h-96 object-contain rounded-lg"
                container-class="flex justify-center"
                placeholder-class="w-32 h-32"
              />
            </div>
          </div>

          <div class="bg-charcoal-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeImageModal"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Person Details Modal -->
    <div v-if="showPersonModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div
          class="fixed inset-0 transition-opacity"
          aria-hidden="true"
          @click="closePersonModal"
        >
          <div class="absolute inset-0 bg-charcoal-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-charcoal-900 mb-4">
                  Person Details
                </h3>

                <div class="space-y-4">
                  <!-- Person Photo -->
                  <div v-if="currentPersonData?.person_photo" class="flex justify-center">
                    <div class="w-24 h-24 rounded-full overflow-hidden bg-charcoal-100">
                      <img
                        :src="currentPersonData.person_photo"
                        alt="Person Photo"
                        class="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <!-- Person Information -->
                  <div class="grid grid-cols-1 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-charcoal-700">Owner Name</label>
                      <p class="mt-1 text-sm text-charcoal-900">
                        {{ `${currentPersonData?.owner_full_name || ''} ${currentPersonData?.owner_full_name || ''}`.trim() || 'N/A' }}
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700">Coordinator Name</label>
                      <p class="mt-1 text-sm text-charcoal-900">
                        {{ `${currentPersonData?.coordinator_full_name || ''} ${currentPersonData?.coordinator_full_name || ''}`.trim() || 'N/A' }}
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700">Mobile Number</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ currentPersonData?.mobile_number || 'N/A' }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700">Emirates ID</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ currentPersonData?.emirates_id || 'N/A' }}</p>
                    </div>

                    <div v-if="currentPersonData?.address">
                      <label class="block text-sm font-medium text-charcoal-700">Address</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ currentPersonData.address }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700">Dispatch Date</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ formatDate(currentPersonData?.issued_date || currentPersonData?.date) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-charcoal-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closePersonModal"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Interest Person Details Modal -->
    <div v-if="showInterestPersonModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div
          class="fixed inset-0 transition-opacity"
          aria-hidden="true"
          @click="closeInterestPersonModal"
        >
          <div class="absolute inset-0 bg-charcoal-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-charcoal-900 mb-4">
                  Interested Person Details
                </h3>

                <div class="space-y-4">
                  <!-- Person Photo -->
                  <div v-if="currentInterestPersonData?.person_photo" class="flex justify-center">
                    <div class="w-24 h-24 rounded-full overflow-hidden bg-charcoal-100">
                      <img
                        :src="currentInterestPersonData.person_photo"
                        alt="Person Photo"
                        class="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <!-- Interest Information -->
                  <div class="grid grid-cols-1 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-charcoal-700">Owner Name</label>
                      <p class="mt-1 text-sm text-charcoal-900">
                        {{ currentInterestPersonData?.owner_full_name || 'N/A' }}
                      </p>
                    </div>

                    <div v-if="currentInterestPersonData?.coordinator_full_name">
                      <label class="block text-sm font-medium text-charcoal-700">Coordinator Name</label>
                      <p class="mt-1 text-sm text-charcoal-900">
                        {{ currentInterestPersonData.coordinator_full_name }}
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700">Mobile Number</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ currentInterestPersonData?.mobile_number || 'N/A' }}</p>
                    </div>

                    <div v-if="currentInterestPersonData?.emirates_id">
                      <label class="block text-sm font-medium text-charcoal-700">Emirates ID</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ currentInterestPersonData.emirates_id }}</p>
                    </div>

                    <div v-if="currentInterestPersonData?.address">
                      <label class="block text-sm font-medium text-charcoal-700">Address</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ currentInterestPersonData.address }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700">Interest Date & Time</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ formatDateTime(currentInterestPersonData?.creation) }}</p>
                    </div>

                    <div v-if="currentInterestPersonData?.created_by_name">
                      <label class="block text-sm font-medium text-charcoal-700">Created By</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ currentInterestPersonData.created_by_name }}</p>
                    </div>

                    <div v-if="currentInterestPersonData?.remarks">
                      <label class="block text-sm font-medium text-charcoal-700">Remarks</label>
                      <p class="mt-1 text-sm text-charcoal-900">{{ currentInterestPersonData.remarks }}</p>
                    </div>

                    <div class="bg-yellow-50 p-3 rounded-lg">
                      <div class="flex items-center space-x-2">
                        <StarIcon class="w-4 h-4 text-yellow-500" />
                        <span class="text-sm text-yellow-700 font-medium">
                          This person has shown interest in this gift
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-charcoal-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              v-if="authStore.canDispatchGifts"
              @click="dispatchToInterest"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Dispatch Gift
            </button>
            <button
              @click="closeInterestPersonModal"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-charcoal-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-charcoal-700 hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Barcode Update Modal -->
    <div v-if="showBarcodeModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div
          class="fixed inset-0 transition-opacity"
          aria-hidden="true"
          @click="closeBarcodeModal"
        >
          <div class="absolute inset-0 bg-charcoal-500 opacity-75"></div>
        </div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg leading-6 font-medium text-charcoal-900">
                Update Barcode
              </h3>
              <button
                @click="closeBarcodeModal"
                class="text-charcoal-400 hover:text-charcoal-600 transition-colors"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>

            <div class="space-y-4">
              <!-- Current Barcode Display -->
              <div v-if="gift.barcode_value" class="bg-charcoal-50 p-3 rounded-lg">
                <div class="text-sm text-charcoal-600 mb-1">Current Barcode ID:</div>
                <code class="text-charcoal-900 font-mono">{{ gift.barcode_value }}</code>
              </div>

              <!-- Barcode Update Options -->
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    id="auto_generate"
                    v-model="barcodeUpdateType"
                    type="radio"
                    value="auto"
                    class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-charcoal-300"
                  />
                  <label for="auto_generate" class="ml-2 block text-sm text-charcoal-900">
                    Auto-generate new barcode
                  </label>
                </div>

                <div class="flex items-center">
                  <input
                    id="manual_entry"
                    v-model="barcodeUpdateType"
                    type="radio"
                    value="manual"
                    class="h-4 w-4 text-gray-600 focus:ring-gray-500 border-charcoal-300"
                  />
                  <label for="manual_entry" class="ml-2 block text-sm text-charcoal-900">
                    Enter custom barcode ID
                  </label>
                </div>
              </div>

              <!-- Manual Barcode Input -->
              <div v-if="barcodeUpdateType === 'manual'" class="space-y-2">
                <label for="new_barcode_value" class="block text-sm font-medium text-charcoal-700">
                  New Barcode ID *
                </label>
                <input
                  id="new_barcode_value"
                  v-model="newBarcodeValue"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter new barcode ID"
                />
                <p v-if="barcodeError" class="text-sm text-red-600">{{ barcodeError }}</p>
              </div>

              <!-- Auto Generate Preview -->
              <div v-if="barcodeUpdateType === 'auto'" class="bg-blue-50 p-3 rounded-lg">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-sm text-blue-700">A new unique barcode ID will be automatically generated</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-charcoal-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="updateBarcode"
              :disabled="barcodeUpdateLoading || (barcodeUpdateType === 'manual' && !newBarcodeValue.trim())"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="barcodeUpdateLoading" class="mr-2">
                <svg class="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ barcodeUpdateLoading ? 'Updating...' : 'Update Barcode' }}
            </button>
            <button
              @click="closeBarcodeModal"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-charcoal-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-charcoal-700 hover:bg-charcoal-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Interest Form Modal -->
    <InterestForm
      :show="showAddInterest"
      :gift-id="gift.name"
      @close="showAddInterest = false"
      @success="handleInterestSuccess"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotifications } from '../../composables/useNotifications.js'
import { useAuthStore } from '@stores/auth'
import { GiftAPI, GiftIssueAPI, GiftInterestAPI } from '../../services/api.js'
import { getImageUrl } from '@utils/imageUtils'

// Components
import AppImage from '../../components/AppImage.vue'
import InterestForm from '../../components/InterestForm.vue'

// Icons
import {
  ArrowLeftIcon,
  GiftIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  PrinterIcon,
  DocumentTextIcon,
  UserIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
  TagIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'GiftDetail',
  components: {
    AppImage,
    InterestForm,
    ArrowLeftIcon,
    GiftIcon,
    PencilIcon,
    EllipsisVerticalIcon,
    DocumentDuplicateIcon,
    TrashIcon,
    ClipboardDocumentIcon,
    PrinterIcon,
    DocumentTextIcon,
    UserIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    QrCodeIcon,
    CheckCircleIcon,
    XMarkIcon,
    ArrowTopRightOnSquareIcon,
    StarIcon,
    TagIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const { showNotification } = useNotifications()

    // State
    const loading = ref(true)
    const error = ref(null)
    const loadingDispatchHistory = ref(false)
    const showMenu = ref(false)
    const menuRef = ref(null)
    const showPersonModal = ref(false)
    const showImageModal = ref(false)
    const selectedImage = ref('')
    const isOnline = ref(navigator.onLine)
    const showMobileMenu = ref(false)
    const mobileMenuRef = ref(null)

    // Interest form modal state
    const showAddInterest = ref(false)

    // Interest person details modal state
    const showInterestPersonModal = ref(false)
    const currentInterestPersonData = ref(null)

    // Barcode update modal state
    const showBarcodeModal = ref(false)
    const barcodeUpdateType = ref('auto')
    const newBarcodeValue = ref('')
    const barcodeError = ref('')
    const barcodeUpdateLoading = ref(false)

    const gift = reactive({})
    const issueHistory = ref({})
    const dispatchHistory = ref([])
    const currentPersonData = ref(null)

    // Interest state
    const interests = ref([])
    const loadingInterests = ref(false)

    // PWA: Network status handling
    const handleOnline = () => {
      isOnline.value = true
      showNotification('Connection restored', 'success')
    }

    const handleOffline = () => {
      isOnline.value = false
      showNotification('You are offline. Some features may not work.', 'warning')
    }

    // Methods
    const loadGift = async () => {
      try {
        loading.value = true
        const giftId = route.params.id

        // PWA: Check if online before making API call
        if (!isOnline.value) {
          error.value = 'You are offline. Please check your connection and try again.'
          return
        }

        const response = await GiftAPI.getDetails(giftId)

        if (response.success) {
          Object.assign(gift, response.data.gift)
          issueHistory.value = response.data.issue_history || {}
        } else {
          error.value = response.error || 'Failed to load gift details'
        }

      } catch (err) {
        console.error('Failed to load gift:', err)
        if (!isOnline.value) {
          error.value = 'You are offline. Please check your connection and try again.'
        } else {
          error.value = 'Failed to load gift details. Please try again.'
        }
      } finally {
        loading.value = false
      }
    }

    const loadDispatchHistory = async () => {
      try {
        loadingDispatchHistory.value = true
        const giftId = route.params.id

        // PWA: Check if online before making API call
        if (!isOnline.value) {
          console.error('Offline - cannot load dispatch history')
          return
        }

        const response = await GiftIssueAPI.getDispatchHistory(giftId)

        if (response.success) {
          dispatchHistory.value = response.data.dispatch_history || []
        } else {
          console.error('Failed to load dispatch history:', response.error)
        }

      } catch (err) {
        console.error('Failed to load dispatch history:', err)
      } finally {
        loadingDispatchHistory.value = false
      }
    }

    const loadInterests = async () => {
      try {
        loadingInterests.value = true
        const giftId = route.params.id

        // PWA: Check if online before making API call
        if (!isOnline.value) {
          console.error('Offline - cannot load interests')
          return
        }

        const response = await GiftInterestAPI.getByGift(giftId)

        if (response.success) {
          interests.value = response.data || []
        } else {
          console.error('Failed to load interests:', response.error)
        }

      } catch (err) {
        console.error('Failed to load interests:', err)
      } finally {
        loadingInterests.value = false
      }
    }

    const closeMenu = (event) => {
      if (menuRef.value && !menuRef.value.contains(event.target)) {
        showMenu.value = false
      }
      // Close mobile menu when clicking outside
      if (mobileMenuRef.value && !mobileMenuRef.value.contains(event.target)) {
        showMobileMenu.value = false
      }
    }

    const goBack = () => {
      router.push('/gifts')
    }

    // Actions
    const issueGift = () => {
      try {
        // PWA: Check if online before navigation
        if (!isOnline.value) {
          showNotification('You are offline. Please connect to the internet to dispatch gifts.', 'error')
          return
        }

        // PWA: Additional checks for gift status
        if (!gift.name) {
          showNotification('Gift information not loaded. Please refresh and try again.', 'error')
          return
        }

        // Navigate to dispatch flow (removed status check to allow dispatch for all statuses)
        // console.log('PWA Debug: Navigating to dispatch flow for gift:', gift.name)
        router.push(`/scan/gift/${gift.name}`)
          .then(() => {
            // console.log('PWA Debug: Navigation successful')
          })
          .catch((error) => {
            console.error('PWA Debug: Navigation failed:', error)
            showNotification('Navigation failed. Please try again.', 'error')
          })
      } catch (error) {
        console.error('Error navigating to dispatch flow:', error)
        showNotification('Failed to open dispatch flow. Please try again.', 'error')
      }
    }

    const editGift = () => {
      try {
        // PWA: Check if online before navigation
        if (!isOnline.value) {
          showNotification('You are offline. Please connect to the internet to edit gifts.', 'warning')
          return
        }

        router.push(`/gifts/${gift.name}/edit`)
      } catch (error) {
        console.error('Error navigating to edit gift:', error)
        showNotification('Failed to open edit form. Please try again.', 'error')
      }
    }

    // PWA-specific menu handlers
    const handleIssueGift = (event) => {
      event?.preventDefault?.()
      event?.stopPropagation?.()
      showMobileMenu.value = false

      // Add small delay to ensure menu closes properly in PWA
      setTimeout(() => {
        issueGift()
      }, 100)
    }

    const handleEditGift = (event) => {
      event?.preventDefault?.()
      event?.stopPropagation?.()
      showMobileMenu.value = false

      setTimeout(() => {
        editGift()
      }, 100)
    }

    const handleGenerateBarcode = (event) => {
      event?.preventDefault?.()
      event?.stopPropagation?.()
      showMobileMenu.value = false

      setTimeout(() => {
        generateBarcode()
      }, 100)
    }

    const handlePrintBarcode = (event) => {
      event?.preventDefault?.()
      event?.stopPropagation?.()
      showMobileMenu.value = false

      setTimeout(() => {
        printBarcode()
      }, 100)
    }

    const handleDownloadBarcode = (event) => {
      event?.preventDefault?.()
      event?.stopPropagation?.()
      showMobileMenu.value = false

      setTimeout(() => {
        downloadBarcode()
      }, 100)
    }

    const duplicateGift = () => {
      router.push(`/gifts/new?duplicate=${gift.name}`)
      showMenu.value = false
    }

    const deleteGift = () => {
      // TODO: Implement delete confirmation modal
      showNotification('Delete functionality will be implemented', 'info')
      showMenu.value = false
    }

    const copyCode = async () => {
      try {
        // PWA-compatible clipboard handling
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(gift.barcode_value)
          showNotification('Barcode ID copied to clipboard', 'success')
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea')
          textArea.value = gift.barcode_value
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          showNotification('Barcode ID copied to clipboard', 'success')
        }
      } catch (error) {
        console.error('Copy failed:', error)
        showNotification('Failed to copy barcode ID', 'error')
      }
    }

    const printBarcode = () => {
      if (!gift.barcode) {
        showNotification('No barcode available to print', 'error')
        return
      }

      // Check if printing is supported (PWA compatibility)
      if (typeof window.print === 'undefined') {
        showNotification('Printing is not supported on this device', 'error')
        return
      }

      try {
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
          showNotification('Please allow pop-ups to print the barcode', 'error')
          return
        }

        printWindow.document.write(`
          <html>
            <head>
              <title>Barcode - ${gift.barcode_value}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @page {
                  size: A6;
                  margin: 10mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  font-family: Arial, sans-serif;
                  font-size: 12pt;
                }
                .barcode-container {
                  text-align: center;
                  width: fit-content;
                }
                img {
                  width: auto;
                  height: auto;
                  max-width: none;
                  display: block;
                  margin: 0 auto;
                }
                .serial-number {
                  margin-top: 8px;
                  font-size: 12pt;
                  color: #000;
                  font-weight: bold;
                  letter-spacing: 1px;
                }
                @media print {
                  body { margin: 0; padding: 0; }
                  .barcode-container { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="barcode-container">
                <img src="${gift.barcode}" alt="Barcode ${gift.barcode_value}" onerror="this.style.display='none'" />
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()

        // PWA-friendly print handling
        printWindow.onload = () => {
          setTimeout(() => {
            try {
              printWindow.print()
            } catch (e) {
              console.error('Print failed:', e)
              showNotification('Print failed. Please try again.', 'error')
            }
          }, 500)
        }
      } catch (error) {
        console.error('Print setup failed:', error)
        showNotification('Print setup failed. Please try again.', 'error')
      }
    }

    const downloadBarcode = async () => {
      if (!gift.barcode) {
        showNotification('No barcode available to download', 'error')
        return
      }

      try {
        showNotification('Preparing download...', 'info')

        // Create a canvas to render the barcode with specified dimensions
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Set canvas dimensions according to specs: 300-600px width, 100-150px height
        const targetWidth = 500 // Middle of 300-600px range
        const targetHeight = 125 // Middle of 100-150px range

        // Set canvas size and DPI (300 DPI equivalent)
        const dpiScale = 300 / 96 // 96 is standard screen DPI
        canvas.width = targetWidth * dpiScale
        canvas.height = targetHeight * dpiScale
        canvas.style.width = targetWidth + 'px'
        canvas.style.height = targetHeight + 'px'

        // Scale the context to ensure correct drawing operations
        ctx.scale(dpiScale, dpiScale)

        // Set white background (as per spec: black on white/transparent background)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, targetWidth, targetHeight)

        // Create an image element to load the barcode
        const img = new Image()
        img.crossOrigin = 'anonymous' // Enable CORS for external images

        return new Promise((resolve, reject) => {
          img.onload = () => {
            try {
              // Calculate scaling to fit the barcode within target dimensions while maintaining aspect ratio
              const imgAspectRatio = img.width / img.height
              const canvasAspectRatio = targetWidth / targetHeight

              let drawWidth, drawHeight, offsetX, offsetY

              if (imgAspectRatio > canvasAspectRatio) {
                // Image is wider relative to canvas
                drawWidth = targetWidth
                drawHeight = targetWidth / imgAspectRatio
                offsetX = 0
                offsetY = (targetHeight - drawHeight) / 2
              } else {
                // Image is taller relative to canvas
                drawHeight = targetHeight
                drawWidth = targetHeight * imgAspectRatio
                offsetX = (targetWidth - drawWidth) / 2
                offsetY = 0
              }

              // Draw the barcode image on the canvas
              ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

              // Convert canvas to blob with high quality PNG
              canvas.toBlob((blob) => {
                if (!blob) {
                  reject(new Error('Failed to create image blob'))
                  return
                }

                // Create download link
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `barcode_${gift.barcode_value || gift.gift_id}_${new Date().getTime()}.png`

                // Trigger download
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                // Clean up
                URL.revokeObjectURL(url)

                showNotification('Barcode downloaded successfully', 'success')
                resolve()
              }, 'image/png', 1.0) // Maximum quality PNG

            } catch (error) {
              console.error('Canvas drawing error:', error)
              reject(error)
            }
          }

          img.onerror = () => {
            console.error('Failed to load barcode image')
            reject(new Error('Failed to load barcode image'))
          }

          // Load the barcode image
          img.src = gift.barcode
        })

      } catch (error) {
        console.error('Download failed:', error)
        showNotification('Failed to download barcode. Please try again.', 'error')
      }
    }

    const generateBarcode = async () => {
      try {
        loading.value = true
        showNotification('Generating barcode...', 'info')

        // Call API to regenerate barcode for this gift
        const response = await GiftAPI.regenerateBarcode(gift.name)

        if (response.success) {
          // Update the gift with the new barcode
          gift.barcode = response.data.barcode
          showNotification('Barcode generated successfully', 'success')
        } else {
          showNotification(response.error || 'Failed to generate barcode', 'error')
        }
      } catch (error) {
        console.error('Failed to generate barcode:', error)
        showNotification('Failed to generate barcode. Please try again.', 'error')
      } finally {
        loading.value = false
      }
    }

    // Barcode modal methods
    const openBarcodeModal = () => {
      showBarcodeModal.value = true
      barcodeUpdateType.value = 'auto'
      newBarcodeValue.value = ''
      barcodeError.value = ''
    }

    const closeBarcodeModal = () => {
      showBarcodeModal.value = false
      barcodeUpdateType.value = 'auto'
      newBarcodeValue.value = ''
      barcodeError.value = ''
    }

    const updateBarcode = async () => {
      try {
        barcodeError.value = ''
        barcodeUpdateLoading.value = true

        // Validate manual input
        if (barcodeUpdateType.value === 'manual') {
          if (!newBarcodeValue.value.trim()) {
            barcodeError.value = 'Barcode ID is required'
            return
          }

          // Basic validation for barcode format
          if (newBarcodeValue.value.length < 3) {
            barcodeError.value = 'Barcode ID must be at least 3 characters long'
            return
          }
        }

        // Prepare the update data
        const updateData = {
          gift_id: gift.name,
          update_type: barcodeUpdateType.value,
          new_barcode_value: barcodeUpdateType.value === 'manual' ? newBarcodeValue.value.trim() : null
        }

        // Call API to update barcode
        const response = await GiftAPI.updateBarcodeValue(updateData)

        if (response.success) {
          // Update local gift data immediately
          gift.barcode_value = response.data.barcode_value
          gift.barcode = response.data.barcode
          gift.import_barcode = barcodeUpdateType.value === 'manual'

          // Also reload the gift data to ensure we have the latest information
          await loadGift()

          showNotification('Barcode updated successfully', 'success')
          closeBarcodeModal()
        } else {
          barcodeError.value = response.error || 'Failed to update barcode'
        }
      } catch (error) {
        console.error('Failed to update barcode:', error)
        barcodeError.value = 'Failed to update barcode. Please try again.'
      } finally {
        barcodeUpdateLoading.value = false
      }
    }

    const openPersonModal = (dispatch = null) => {
      // If dispatch is provided, use it; otherwise fall back to issueHistory
      const personData = dispatch || issueHistory.value
      currentPersonData.value = personData
      showPersonModal.value = true
    }

    const closePersonModal = () => {
      showPersonModal.value = false
    }

    const openInterestPersonModal = (interest) => {
      currentInterestPersonData.value = interest
      showInterestPersonModal.value = true
    }

    const closeInterestPersonModal = () => {
      showInterestPersonModal.value = false
      currentInterestPersonData.value = null
    }

    const dispatchToInterest = () => {
      // Close the modal first
      closeInterestPersonModal()
      
      // Navigate to dispatch this gift to the interested person
      try {
        if (!isOnline.value) {
          showNotification('You are offline. Please connect to the internet to dispatch gifts.', 'error')
          return
        }

        if (!gift.name) {
          showNotification('Gift information not loaded. Please refresh and try again.', 'error')
          return
        }

        if (!currentInterestPersonData.value) {
          showNotification('Interest person data not available.', 'error')
          return
        }

        // Navigate to dispatch flow with the interested person's details as query parameters
        const queryParams = {
          preselect_recipient: 'true',
          owner_full_name: currentInterestPersonData.value.owner_full_name || '',
          coordinator_full_name: currentInterestPersonData.value.coordinator_full_name || '',
          mobile_number: currentInterestPersonData.value.mobile_number || '',
          emirates_id: currentInterestPersonData.value.emirates_id || '',
          address: currentInterestPersonData.value.address || ''
        }

        router.push({
          path: `/scan/gift/${gift.name}`,
          query: queryParams
        })
      } catch (error) {
        console.error('Error navigating to dispatch flow:', error)
        showNotification('Failed to open dispatch flow. Please try again.', 'error')
      }
    }

    const dispatchToSpecificInterest = (interest) => {
      try {
        if (!isOnline.value) {
          showNotification('You are offline. Please connect to the internet to dispatch gifts.', 'error')
          return
        }

        if (!gift.name) {
          showNotification('Gift information not loaded. Please refresh and try again.', 'error')
          return
        }

        if (!interest) {
          showNotification('Interest person data not available.', 'error')
          return
        }

        // Navigate to dispatch flow with the interested person's details as query parameters
        const queryParams = {
          preselect_recipient: 'true',
          owner_full_name: interest.owner_full_name || '',
          coordinator_full_name: interest.coordinator_full_name || '',
          mobile_number: interest.mobile_number || '',
          emirates_id: interest.emirates_id || '',
          address: interest.address || ''
        }

        router.push({
          path: `/scan/gift/${gift.name}`,
          query: queryParams
        })
      } catch (error) {
        console.error('Error navigating to dispatch flow:', error)
        showNotification('Failed to open dispatch flow. Please try again.', 'error')
      }
    }

    const openImageModal = (imageUrl) => {
      // Use the image utility to get the proper URL for the modal
      selectedImage.value = getImageUrl(imageUrl)
      showImageModal.value = true
    }

    const closeImageModal = () => {
      showImageModal.value = false
      selectedImage.value = ''
    }

    // Utility functions
    const formatCategory = (category) => {
      return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'General'
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const formatDateTime = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString('en-AE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    const getStatusClasses = (status) => {
      const classes = {
        Available: 'bg-gray-100 text-gray-800',
        Issued: 'bg-blue-100 text-blue-800',
        Dispatched: 'bg-blue-100 text-blue-800',
        available: 'bg-gray-100 text-gray-800',
        issued: 'bg-blue-100 text-blue-800',
        dispatched: 'bg-blue-100 text-blue-800'
      }
      return classes[status] || classes.Available
    }

    const getStatusDotClasses = (status) => {
      const classes = {
        Available: 'bg-gray-500',
        Issued: 'bg-blue-500',
        Dispatched: 'bg-blue-500',
        available: 'bg-gray-500',
        issued: 'bg-blue-500',
        dispatched: 'bg-blue-500'
      }
      return classes[status] || classes.Available
    }

    const getStatusText = (status) => {
      const statusMap = {
        'Issued': 'Dispatched',
        'issued': 'Dispatched'
      }
      return statusMap[status] || status || 'Available'
    }

    const getExpiryClasses = (expiryDate) => {
      if (!expiryDate) return ''

      const dateObj = new Date(expiryDate)
      const now = new Date()
      const diffDays = Math.ceil((dateObj - now) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'text-red-600'
      if (diffDays <= 7) return 'text-gold-600'
      return ''
    }

    const getDocStatus = (status) => {
      const statuses = {
        0: 'Draft',
        1: 'Submitted',
        2: 'Cancelled'
      }
      return statuses[status] || 'Unknown'
    }

    // Lifecycle
    onMounted(async () => {
      // Load user role for permissions
      if (!authStore.userRole) {
        await authStore.loadUserRole()
      }

      loadGift()
      loadDispatchHistory()
      loadInterests()
      document.addEventListener('click', closeMenu)

      // PWA: Add network status listeners
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    })

    onUnmounted(() => {
      document.removeEventListener('click', closeMenu)

      // PWA: Remove network status listeners
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    })

    const handleInterestSuccess = () => {
      showNotification('Interest added successfully', 'success')
      showAddInterest.value = false
      // Reload interests to show the new one
      loadInterests()
    }

    return {
      // Stores
      authStore,
      // State
      loading,
      error,
      loadingDispatchHistory,
      gift,
      issueHistory,
      dispatchHistory,
      currentPersonData,
      // Interest state
      interests,
      loadingInterests,
      showMenu,
      menuRef,
      showPersonModal,
      showImageModal,
      selectedImage,
      isOnline,
      showMobileMenu,
      mobileMenuRef,
      // Interest modal state
      showAddInterest,
      showInterestPersonModal,
      currentInterestPersonData,
      // Barcode modal state
      showBarcodeModal,
      barcodeUpdateType,
      newBarcodeValue,
      barcodeError,
      barcodeUpdateLoading,
      goBack,
      issueGift,
      editGift,
      duplicateGift,
      deleteGift,
      // PWA-specific handlers
      handleIssueGift,
      handleEditGift,
      handleGenerateBarcode,
      handlePrintBarcode,
      handleDownloadBarcode,
      copyCode,
      printBarcode,
      downloadBarcode,
      generateBarcode,
      loadDispatchHistory,
      loadInterests,
      openPersonModal,
      closePersonModal,
      openInterestPersonModal,
      closeInterestPersonModal,
      dispatchToInterest,
      dispatchToSpecificInterest,
      openImageModal,
      closeImageModal,
      // Barcode modal methods
      openBarcodeModal,
      closeBarcodeModal,
      updateBarcode,
      // Interest methods
      handleInterestSuccess,
      // Utility functions
      formatCategory,
      formatDate,
      formatDateTime,
      getStatusClasses,
      getStatusDotClasses,
      getStatusText,
      getExpiryClasses,
      getDocStatus
    }
  }
}
</script>

<style scoped>
/* Loading animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus styles */
button:focus {
  outline: 2px solid #006C57;
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none !important;
  }

  .transition-colors {
    transition: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .shadow-card {
    border: 1px solid #374151;
  }

  .shadow-elevated {
    border: 2px solid #374151;
  }
}

/* Print styles */
@media print {
  .shadow-card,
  .shadow-elevated {
    border: 1px solid #374151 !important;
    box-shadow: none !important;
  }
}

/* PWA bottom navbar safe area */
.pb-safe-navbar {
  /* Default padding bottom for desktop */
  padding-bottom: 2rem;
}

/* Mobile PWA bottom navbar spacing */
@media (max-width: 1024px) {
  .pb-safe-navbar {
    /* Account for bottom tab bar (64px) + extra spacing (32px) */
    padding-bottom: 6rem;
  }
}

/* iOS safe area support for PWA */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  @media (max-width: 1024px) {
    .pb-safe-navbar {
      /* Account for bottom tab bar + safe area + extra spacing */
      padding-bottom: calc(6rem + env(safe-area-inset-bottom));
    }
  }
}

/* Standalone PWA mode (when installed) */
@media (display-mode: standalone) {
  .pb-safe-navbar {
    /* Extra padding for standalone PWA mode */
    padding-bottom: calc(6rem + 1rem);
  }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  @media (display-mode: standalone) {
    .pb-safe-navbar {
      /* Comprehensive spacing for standalone PWA with safe area */
      padding-bottom: calc(6rem + 1rem + env(safe-area-inset-bottom));
    }
  }
}
</style>

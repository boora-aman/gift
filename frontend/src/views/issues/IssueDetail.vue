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
        <h3 class="text-lg font-semibold text-charcoal-900 mb-2">Issue Not Found</h3>
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

    <!-- Issue Detail Content -->
    <div v-else>
      <!-- Mobile Header with Actions -->
      <div class="lg:hidden bg-white border-b border-charcoal-200 px-4 py-4 sticky top-0 z-30">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button
              @click="$router.go(-1)"
              class="p-2 text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon class="w-5 h-5" />
            </button>
            <h1 class="text-lg font-semibold text-charcoal-900 truncate">
              Gift Dispatch Details
            </h1>
          </div>
          
          <!-- Mobile Actions Menu -->
          <div class="relative">
            <!-- Backdrop for mobile -->
            <div
              v-show="showActionsDropdown"
              class="fixed inset-0 bg-black bg-opacity-25 z-40"
              @click="showActionsDropdown = false"
            ></div>
            
            <button
              @click="showActionsDropdown = !showActionsDropdown"
              class="p-2 text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 rounded-lg transition-colors relative z-50"
            >
              <EllipsisVerticalIcon class="w-5 h-5" />
            </button>
            
            <!-- Dropdown Menu -->
            <div
              v-show="showActionsDropdown"
              class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-charcoal-200 py-1 z-50"
              @click.stop
            >
              <button
                @click="showDispatchMoreModal = true; showActionsDropdown = false"
                class="w-full flex items-center px-4 py-3 text-sm text-green-700 hover:bg-green-50 transition-colors"
              >
                <GiftIcon class="w-4 h-4 mr-3" />
                Dispatch More Gift
              </button>
              
              <div class="border-t border-charcoal-100 my-1"></div>
              
              <button
                @click="showEditForm = true; showActionsDropdown = false"
                class="w-full flex items-center px-4 py-3 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
              >
                <PencilIcon class="w-4 h-4 mr-3" />
                Edit Dispatch
              </button>
              
              <button
                @click="copyIssueDetails(); showActionsDropdown = false"
                class="w-full flex items-center px-4 py-3 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
              >
                <ClipboardDocumentIcon class="w-4 h-4 mr-3" />
                Copy Details
              </button>
              
              <div class="border-t border-charcoal-100 my-1"></div>
              
              <button
                @click="deleteIssue(); showActionsDropdown = false"
                class="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <TrashIcon class="w-4 h-4 mr-3" />
                Delete Dispatch
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content - Full width on mobile, 2/3 width on desktop -->
          <div class="col-span-1 lg:col-span-2 space-y-8">
            <!-- Gift Dispatch Information -->
            <div class="bg-white rounded-xl shadow-card p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-charcoal-900">Gift Dispatch Information</h2>
                <!-- Desktop Edit Button -->
                <button
                  @click="showEditForm = true"
                  class="hidden lg:inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <PencilIcon class="w-4 h-4 mr-1.5" />
                  Edit
                </button>
              </div>
              
              <div class="space-y-6">
                <!-- Gift Information Section -->
                <div class="flex items-start space-x-6">
                  <div class="flex-shrink-0">
                    <!-- Gift Image or Icon -->
                    <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center relative">
                      <!-- Image -->
                      <img 
                        v-if="issue.gift_details?.first_image" 
                        :src="issue.gift_details.first_image" 
                        :alt="issue.gift_details?.gift_name || 'Gift image'"
                        class="w-full h-full object-cover absolute inset-0"
                        :class="{ 'opacity-100': imageLoaded, 'opacity-0': !imageLoaded }"
                        @load="imageLoaded = true"
                        @error="imageLoaded = false"
                      />
                      <!-- Fallback icon -->
                      <GiftIcon 
                        class="w-10 h-10 text-gray-700" 
                        :class="{ 'opacity-100': !imageLoaded || !issue.gift_details?.first_image, 'opacity-0': imageLoaded && issue.gift_details?.first_image }"
                      />
                    </div>
                  </div>
                  
                  <div class="flex-1">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <!-- Left section: Gift Name and Description -->
                      <div class="md:col-span-2 space-y-3">
                        <!-- Gift Name -->
                        <div>
                          <label class="block text-sm font-medium text-charcoal-700 mb-1">
                            Gift Name
                          </label>
                          <router-link
                            :to="`/gifts/${issue.gift}`"
                            class="text-gray-700 hover:text-gray-800 font-semibold text-lg"
                          >
                            {{ issue.gift_details?.gift_name || issue.gift_name || issue.gift }}
                          </router-link>
                        </div>
                      </div>

                      <!-- Right section: Category -->
                      <div class="space-y-4">
                        <!-- Category -->
                        <div>
                          <label class="block text-sm font-medium text-charcoal-700 mb-1">
                            Category
                          </label>
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {{ formatCategory(issue.gift_details?.category || issue.category) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Dispatch Details Section -->
                <div class="border-t border-charcoal-100 pt-6">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-charcoal-700 mb-1">
                        Dispatch Date
                      </label>
                      <p class="text-charcoal-900 font-medium">{{ formatDate(issue.date) }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700 mb-1">
                        Dispatch ID
                      </label>
                      <p class="text-charcoal-900 font-mono text-sm">{{ issue.name }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700 mb-1">
                        Status
                      </label>
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="{
                          'bg-blue-100 text-blue-800': issue.status === 'Dispatched',
                          'bg-green-100 text-green-800': issue.status === 'Delivered'
                        }"
                      >
                        {{ issue.status || 'Dispatched' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recipient Information -->
            <div class="bg-white rounded-xl shadow-card p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-charcoal-900">Recipient Information</h2>
                <!-- Desktop Edit Button -->
                <button
                  @click="showEditForm = true"
                  class="hidden lg:inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <PencilIcon class="w-4 h-4 mr-1.5" />
                  Edit
                </button>
              </div>
              
              <div class="flex items-start space-x-6 mb-6">
                <!-- Person Photo -->
                <div class="flex-shrink-0">
                  <div class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      v-if="issue.person_photo"
                      :src="getFullImageUrl(issue.person_photo)"
                      :alt="`${getOwnerFullName()} photo`"
                      class="w-full h-full object-cover"
                      @error="handleImageError"
                    />
                    <UserIcon 
                      v-else
                      class="w-10 h-10 text-gray-700"
                    />
                  </div>
                </div>

                <!-- Basic Info -->
                <div class="flex-1">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Owner Information -->
                    <div>
                      <label class="block text-sm font-medium text-charcoal-700 mb-1">
                        Owner Name
                      </label>
                      <p class="text-charcoal-900 font-medium">{{ getOwnerFullName() }}</p>
                    </div>

                    <!-- Coordinator Information -->
                    <div>
                      <label class="block text-sm font-medium text-charcoal-700 mb-1">
                        Coordinator Name
                      </label>
                      <p class="text-charcoal-900 font-medium">{{ getCoordinatorFullName() }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700 mb-1">
                        Coordinator Emirates ID
                      </label>
                      <div class="flex items-center space-x-2">
                        <p class="text-charcoal-900 font-mono">{{ issue.emirates_id }}</p>
                        <button
                          @click="copyToClipboard(issue.emirates_id, 'Emirates ID')"
                          class="p-1 text-charcoal-500 hover:text-gray-700 transition-colors"
                          title="Copy Emirates ID"
                        >
                          <ClipboardDocumentIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div v-if="issue.mobile_number">
                      <label class="block text-sm font-medium text-charcoal-700 mb-1">
                        Coordinator Mobile Number
                      </label>
                      <div class="flex items-center space-x-2">
                        <p class="text-charcoal-900">{{ issue.mobile_number }}</p>
                        <button
                          @click="callRecipient"
                          class="p-1 text-charcoal-500 hover:text-gray-700 transition-colors"
                          title="Call recipient"
                        >
                          <PhoneIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Delivery Information -->
            <div class="bg-white rounded-xl shadow-card p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-charcoal-900">Delivery Information</h2>
                <!-- Update Delivery Button -->
                <button
                  v-if="issue.status === 'Dispatched'"
                  @click="showDeliveryModal = true"
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckIcon class="w-4 h-4 mr-1.5" />
                  Update Delivery Info
                </button>
              </div>
              
              <div v-if="issue.status === 'Delivered'" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-charcoal-700 mb-1">
                      Delivery Date
                    </label>
                    <p class="text-charcoal-900 font-medium">{{ formatDate(issue.delivery_date) }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-charcoal-700 mb-1">
                      Delivery Status
                    </label>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </div>
                </div>

                <div v-if="issue.delivery_note" class="space-y-2">
                  <label class="block text-sm font-medium text-charcoal-700">
                    Delivery Note
                  </label>
                  <div class="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-charcoal-900 flex-1">{{ getFileName(issue.delivery_note) }}</span>
                    <a
                      :href="getFullImageUrl(issue.delivery_note)"
                      target="_blank"
                      class="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
                      title="Download file"
                    >
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </a>
                  </div>
                </div>

                <div v-if="issue.delivery_description" class="space-y-2">
                  <label class="block text-sm font-medium text-charcoal-700">
                    Delivery Description
                  </label>
                  <p class="text-charcoal-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{{ issue.delivery_description }}</p>
                </div>
              </div>

              <div v-else class="text-center py-8">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4v4H7V9a4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-charcoal-900 mb-2">Awaiting Delivery</h3>
                <p class="text-charcoal-600 mb-4">This gift has been dispatched but not yet delivered.</p>
                <button
                  @click="showDeliveryModal = true"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <CheckIcon class="w-4 h-4 mr-2" />
                  Mark as Delivered
                </button>
              </div>
            </div>


            
          </div>

          <!-- Sidebar - Hidden on mobile, visible on desktop -->
          <div class="hidden lg:block lg:col-span-1 space-y-6">
            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow-card p-6">
              <h3 class="text-lg font-semibold text-charcoal-900 mb-4">Actions</h3>
              
              <!-- Desktop buttons -->
              <div class="space-y-3">
                <button
                  @click="showDispatchMoreModal = true"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <GiftIcon class="w-4 h-4 mr-2" />
                  Dispatch More Gift
                </button>
                
                <button
                  @click="showEditForm = true"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  <PencilIcon class="w-4 h-4 mr-2" />
                  Edit Dispatch
                </button>
                
                <button
                  @click="copyIssueDetails"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
                >
                  <ClipboardDocumentIcon class="w-4 h-4 mr-2" />
                  Copy Details
                </button>
                
                <button
                  @click="deleteIssue"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <TrashIcon class="w-4 h-4 mr-2" />
                  Delete Dispatch
                </button>
              </div>
            </div>

            <!-- Issue Metadata -->
            <div class="bg-white rounded-xl shadow-card p-6">
              <h3 class="text-lg font-semibold text-charcoal-900 mb-4">Details</h3>
              
              <div class="space-y-4 text-sm">
                <div class="flex justify-between">
                  <span class="text-charcoal-600">Dispatch ID</span>
                  <span class="text-charcoal-900 font-mono">{{ issue.name }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-charcoal-600">Created</span>
                  <span class="text-charcoal-900">{{ formatDate(issue.creation) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-charcoal-600">Modified</span>
                  <span class="text-charcoal-900">{{ formatDate(issue.modified) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-charcoal-600">Issued by</span>
                  <span class="text-charcoal-900">{{ issue.owner || 'System' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Form Modal -->
      <div v-if="showEditForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-charcoal-900">Edit Gift Issue</h3>
              <button
                @click="cancelEdit"
                class="p-2 text-charcoal-500 hover:text-charcoal-700 transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="saveChanges" class="space-y-6">
              <!-- Personal Information -->
              <div class="space-y-4">
                <h4 class="text-lg font-medium text-charcoal-900">Personal Information</h4>
                
                <!-- Owner Information -->
                <div class="space-y-4">
                  <h5 class="text-md font-medium text-charcoal-800">Owner Details</h5>
                  <div>
                    <label class="block text-sm font-medium text-charcoal-700 mb-1">
                      Owner Full Name *
                    </label>
                    <input
                      v-model="editForm.owner_full_name"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      :class="{ 'border-red-500': errors.owner_full_name }"
                    />
                    <p v-if="errors.owner_full_name" class="text-red-600 text-sm mt-1">{{ errors.owner_full_name }}</p>
                  </div>
                </div>

                <!-- Coordinator Information -->
                <div class="space-y-4">
                  <h5 class="text-md font-medium text-charcoal-800">Coordinator Details</h5>
                  <div>
                    <label class="block text-sm font-medium text-charcoal-700 mb-1">
                      Coordinator Full Name *
                    </label>
                    <input
                      v-model="editForm.coordinator_full_name"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      :class="{ 'border-red-500': errors.coordinator_full_name }"
                    />
                    <p v-if="errors.coordinator_full_name" class="text-red-600 text-sm mt-1">{{ errors.coordinator_full_name }}</p>
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="space-y-4">
                  <h5 class="text-md font-medium text-charcoal-800">Contact Details</h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-charcoal-700 mb-1">
                        Emirates ID
                      </label>
                      <input
                        v-model="editForm.emirates_id"
                        type="text"
                        placeholder="xxx-xxxx-xxxxxxx-x"
                        class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                        :class="{ 'border-red-500': errors.emirates_id }"
                      />
                      <p v-if="errors.emirates_id" class="text-red-600 text-sm mt-1">{{ errors.emirates_id }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-charcoal-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        v-model="editForm.mobile_number"
                        type="tel"
                        placeholder="+971 50 123 4567"
                        class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                        :class="{ 'border-red-500': errors.mobile_number }"
                      />
                      <p v-if="errors.mobile_number" class="text-red-600 text-sm mt-1">{{ errors.mobile_number }}</p>
                    </div>
                  </div>
                </div>

                <!-- Photo Upload -->
                <div>
                  <label class="block text-sm font-medium text-charcoal-700 mb-1">
                    Person Photo
                  </label>
                  <div class="flex items-center space-x-4">
                    <!-- Current Photo Preview -->
                    <div class="w-16 h-16 rounded-lg overflow-hidden bg-charcoal-100 flex items-center justify-center">
                      <img 
                        v-if="editForm.person_photo"
                        :src="getFullImageUrl(editForm.person_photo)"
                        :alt="'Preview photo'"
                        class="w-full h-full object-cover"
                        @error="handleImageError"
                      />
                      <UserIcon 
                        v-else
                        class="w-8 h-8 text-charcoal-400"
                      />
                    </div>
                    
                    <!-- File Input -->
                    <div class="flex-1">
                      <input
                        ref="photoInput"
                        type="file"
                        accept="image/*"
                        @change="handlePhotoChange"
                        class="hidden"
                      />
                      <button
                        type="button"
                        @click="$refs.photoInput.click()"
                        class="inline-flex items-center px-3 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
                      >
                        <PhotoIcon class="w-4 h-4 mr-2" />
                        {{ editForm.person_photo ? 'Change Photo' : 'Upload Photo' }}
                      </button>
                      <p class="text-xs text-charcoal-500 mt-1">
                        JPG, PNG or WebP. Max file size 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dispatch Information -->
              <div class="space-y-4">
                <h4 class="text-lg font-medium text-charcoal-900">Dispatch Information</h4>
                
                <div>
                  <label class="block text-sm font-medium text-charcoal-700 mb-1">
                    Dispatch Date
                  </label>
                  <input
                    v-model="editForm.date"
                    type="date"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                    :class="{ 'border-red-500': errors.date }"
                  />
                  <p v-if="errors.date" class="text-red-600 text-sm mt-1">{{ errors.date }}</p>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="flex items-center justify-end space-x-3 pt-6 border-t border-charcoal-200">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="px-4 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-elevated max-w-md w-full p-6">
          <div class="flex items-center mb-4">
            <ExclamationTriangleIcon class="w-8 h-8 text-red-500 mr-3" />
            <h3 class="text-lg font-semibold text-charcoal-900">Confirm Deletion</h3>
          </div>
          
          <p class="text-charcoal-600 mb-6">
            Are you sure you want to delete this gift issue? This action cannot be undone.
          </p>
          
          <div class="flex items-center justify-end space-x-3">
            <button
              @click="showDeleteConfirm = false"
              class="px-4 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delivery Update Modal -->
      <div v-if="showDeliveryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-charcoal-900">Update Delivery Information</h3>
              <button
                @click="cancelDeliveryUpdate"
                class="p-2 text-charcoal-500 hover:text-charcoal-700 transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <form @submit.prevent="updateDeliveryStatus" class="space-y-6">
              <!-- Delivery Date -->
              <div>
                <label class="block text-sm font-medium text-charcoal-700 mb-1">
                  Delivery Date *
                </label>
                <input
                  v-model="deliveryForm.delivery_date"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  :class="{ 'border-red-500': deliveryErrors.delivery_date }"
                />
                <p v-if="deliveryErrors.delivery_date" class="text-red-600 text-sm mt-1">{{ deliveryErrors.delivery_date }}</p>
              </div>

              <!-- Delivery Note -->
              <div>
                <label class="block text-sm font-medium text-charcoal-700 mb-1">
                  Delivery Note (Attachment)
                </label>
                <div class="flex items-center space-x-4">
                  <!-- Current File Preview -->
                  <div v-if="deliveryForm.delivery_note" class="flex items-center space-x-2 text-sm">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-charcoal-900">{{ getFileName(deliveryForm.delivery_note) }}</span>
                    <button
                      type="button"
                      @click="deliveryForm.delivery_note = ''"
                      class="text-red-500 hover:text-red-700"
                      title="Remove file"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                  
                  <!-- File Input -->
                  <div class="flex-1">
                    <input
                      ref="deliveryNoteInput"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      @change="handleDeliveryNoteChange"
                      class="hidden"
                    />
                    <button
                      type="button"
                      @click="$refs.deliveryNoteInput.click()"
                      class="inline-flex items-center px-3 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {{ deliveryForm.delivery_note ? 'Change File' : 'Upload File' }}
                    </button>
                    <p class="text-xs text-charcoal-500 mt-1">
                      PDF, DOC, DOCX, TXT, JPG, PNG. Max file size 5MB.
                    </p>
                  </div>
                </div>
                <p v-if="deliveryErrors.delivery_note" class="text-red-600 text-sm mt-1">{{ deliveryErrors.delivery_note }}</p>
              </div>

              <!-- Delivery Description -->
              <div>
                <label class="block text-sm font-medium text-charcoal-700 mb-1">
                  Delivery Description
                </label>
                <textarea
                  v-model="deliveryForm.delivery_description"
                  rows="4"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Describe how the delivery was completed (optional)"
                ></textarea>
              </div>

              <!-- Form Actions -->
              <div class="flex items-center justify-end space-x-3 pt-6 border-t border-charcoal-200">
                <button
                  type="button"
                  @click="cancelDeliveryUpdate"
                  class="px-4 py-2 border border-charcoal-300 text-sm font-medium rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="updatingDelivery"
                  class="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ updatingDelivery ? 'Updating...' : 'Mark as Delivered' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Dispatch More Gifts Modal -->
      <div v-if="showDispatchMoreModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-elevated max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-xl font-semibold text-charcoal-900">Dispatch More Gift</h3>
                <p class="text-sm text-charcoal-600 mt-1">
                  Dispatching to: <span class="font-medium">{{ getOwnerFullName() }}</span>
                  <span v-if="issue.emirates_id" class="text-charcoal-500"> ({{ issue.emirates_id }})</span>
                </p>
              </div>
              <button
                @click="cancelDispatchMore"
                class="p-2 text-charcoal-500 hover:text-charcoal-700 transition-colors"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Search and Filters -->
            <div class="mb-6">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  v-model="giftSearchQuery"
                  type="text"
                  class="w-full pl-10 pr-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Search by gift name, code, or category..."
                />
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingAvailableGifts" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p class="text-charcoal-600 mt-2">Loading available gifts...</p>
            </div>

            <!-- Gift List -->
            <div v-else-if="filteredAvailableGifts.length === 0" class="text-center py-8">
              <GiftIcon class="w-16 h-16 text-charcoal-400 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-charcoal-900 mb-2">No Available Gifts</h3>
              <p class="text-charcoal-600">{{ giftSearchQuery ? 'No gifts match your search criteria.' : 'There are no available gifts to dispatch at the moment.' }}</p>
            </div>

            <div v-else class="max-h-96 overflow-y-auto border border-charcoal-200 rounded-lg">
              <div
                v-for="gift in filteredAvailableGifts"
                :key="gift.name"
                @click="!dispatchingMoreGift && selectGiftForDispatch(gift)"
                class="p-4 border-b border-charcoal-200 last:border-b-0 transition-colors"
                :class="{
                  'hover:bg-green-50 cursor-pointer': !dispatchingMoreGift,
                  'opacity-50 cursor-not-allowed': dispatchingMoreGift
                }"
              >
                <div class="flex items-center space-x-4">
                  <!-- Gift Image -->
                  <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      v-if="gift.first_image"
                      :src="gift.first_image"
                      :alt="gift.gift_name"
                      class="w-full h-full object-cover"
                      @error="$event.target.style.display='none'"
                    />
                    <GiftIcon 
                      v-else
                      class="w-8 h-8 text-gray-700"
                    />
                  </div>

                  <!-- Gift Details -->
                  <div class="flex-1">
                    <h4 class="font-semibold text-charcoal-900">{{ gift.gift_name }}</h4>
                    <p class="text-sm text-charcoal-600">{{ gift.gift_id || gift.barcode_value }}</p>
                    <div class="flex items-center space-x-2 mt-1">
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ formatCategory(gift.category) }}
                      </span>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    </div>
                  </div>

                  <!-- Select Button -->
                  <div>
                    <button
                      @click.stop="selectGiftForDispatch(gift)"
                      :disabled="dispatchingMoreGift"
                      class="inline-flex items-center px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors"
                      :class="{
                        'text-white bg-green-600 border-green-600 hover:bg-green-700': !dispatchingMoreGift,
                        'text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed': dispatchingMoreGift
                      }"
                    >
                      <span v-if="!dispatchingMoreGift">Select</span>
                      <span v-else class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Dispatching...
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Actions -->
            <div class="flex items-center justify-end space-x-3 pt-6 border-t border-charcoal-200">
              <button
                @click="cancelDispatchMore"
                :disabled="dispatchingMoreGift"
                class="px-4 py-2 border text-sm font-medium rounded-lg transition-colors"
                :class="{
                  'border-charcoal-300 text-charcoal-700 bg-white hover:bg-charcoal-50': !dispatchingMoreGift,
                  'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed': dispatchingMoreGift
                }"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotifications } from '@composables/useNotifications'
import { GiftIssueAPI, FileAPI, GiftAPI } from '@services/api'

// Icons
import {
  ArrowLeftIcon,
  GiftIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhoneIcon,
  PhotoIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'IssueDetail',
  components: {
    ArrowLeftIcon,
    GiftIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    PencilIcon,
    PlusIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    UserIcon,
    PhoneIcon,
    PhotoIcon,
    TrashIcon,
    EllipsisVerticalIcon
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { showNotification } = useNotifications()

    // State
    const loading = ref(true)
    const error = ref(null)
    const showEditForm = ref(false)
    const showDeleteConfirm = ref(false)
    const showDeliveryModal = ref(false)
    const showDispatchMoreModal = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const updatingDelivery = ref(false)
    const imageLoaded = ref(false)
    const showActionsDropdown = ref(false)
    
    // Dispatch More Gifts state
    const loadingAvailableGifts = ref(false)
    const availableGifts = ref([])
    const giftSearchQuery = ref('')
    const dispatchingMoreGift = ref(false)
    
    const issue = reactive({})
    const editForm = reactive({})
    const errors = reactive({})
    const deliveryForm = reactive({
      delivery_date: '',
      delivery_note: '',
      delivery_description: ''
    })
    const deliveryErrors = reactive({})

    // Methods
    const loadIssue = async () => {
      try {
        loading.value = true
        const issueId = route.params.id

        const response = await GiftIssueAPI.get(issueId)
        
        if (response.success) {
          // Clear existing data first
          Object.keys(issue).forEach(key => delete issue[key])
          // Reset image state
          imageLoaded.value = false
          // Then assign new data
          Object.assign(issue, response.data)
          
          // Initialize edit form with current data
          resetEditForm()
        } else {
          throw new Error(response.error || 'Failed to load issue')
        }

      } catch (err) {
        console.error('Failed to load issue:', err)
        error.value = err.message || 'Failed to load dispatch details. Please try again.'
      } finally {
        loading.value = false
      }
    }

    const resetEditForm = () => {
      Object.assign(editForm, {
        owner_full_name: issue.owner_full_name || '',
        coordinator_full_name: issue.coordinator_full_name || '',
        emirates_id: issue.emirates_id || '',
        mobile_number: issue.mobile_number || '',
        person_photo: issue.person_photo || '',
        date: issue.date || ''
      })
      Object.keys(errors).forEach(key => delete errors[key])
    }

  const isValidUAEMobile = (mobile) => {
    // Remove all spaces, hyphens, and other non-digit characters except +
    const cleanMobile = mobile.replace(/[\s\-()]/g, '')
    
    // UAE mobile number patterns
    const patterns = [
      /^\+971(50|51|52|53|54|55|56|58)\d{7}$/, // +971501234567
      /^00971(50|51|52|53|54|55|56|58)\d{7}$/, // 00971501234567
      /^0(50|51|52|53|54|55|56|58)\d{7}$/, // 0501234567
      /^(50|51|52|53|54|55|56|58)\d{7}$/ // 501234567
    ]
    
    return patterns.some(pattern => pattern.test(cleanMobile))
  }

  const isValidEmiratesID = (emiratesId) => {
    // Remove all spaces and hyphens
    const cleanId = emiratesId.replace(/[\s\-]/g, '')
    
    // Emirates ID can be entered with or without hyphens
    // Format: 784-YYYY-NNNNNNN-C or 784YYYYNNNNNNNC
    // Where 784 is UAE country code, YYYY is year, NNNNNNN is sequence, C is check digit
    const patterns = [
      /^\d{3}-\d{4}-\d{7}-\d{1}$/, // With hyphens: 784-1234-1234567-8
      /^\d{15}$/ // Without hyphens: 784123412345678
    ]
    
    return patterns.some(pattern => pattern.test(emiratesId)) || /^\d{15}$/.test(cleanId)
  }

  const validateForm = () => {
      Object.keys(errors).forEach(key => delete errors[key])
      let isValid = true

      if (!editForm.owner_full_name.trim()) {
        errors.owner_full_name = 'Owner Full Name is required'
        isValid = false
      }

      if (!editForm.coordinator_full_name.trim()) {
        errors.coordinator_full_name = 'Coordinator Full Name is required'
        isValid = false
      }

      // Emirates ID is optional, but if provided, it should be valid
      if (editForm.emirates_id.trim() && !isValidEmiratesID(editForm.emirates_id)) {
        errors.emirates_id = 'Please enter a valid Emirates ID (e.g., 784-1234-1234567-8)'
        isValid = false
      }

      if (editForm.mobile_number && !isValidUAEMobile(editForm.mobile_number)) {
        errors.mobile_number = 'Please enter a valid UAE mobile number (e.g., +971501234567, 0501234567, 501234567)'
        isValid = false
      }

      if (!editForm.date) {
        errors.date = 'Dispatch date is required'
        isValid = false
      }

      return isValid
    }

    const saveChanges = async () => {
      if (!validateForm()) return

      try {
        saving.value = true

        const response = await GiftIssueAPI.update(issue.name, editForm)
        
        if (response.success) {
          Object.assign(issue, editForm)
          showEditForm.value = false
          showNotification('Gift issue updated successfully', 'success')
        } else {
          throw new Error(response.error || 'Failed to update issue')
        }

      } catch (err) {
        console.error('Failed to save changes:', err)
        showNotification(err.message || 'Failed to save changes', 'error')
      } finally {
        saving.value = false
      }
    }

    const cancelEdit = () => {
      showEditForm.value = false
      resetEditForm()
    }

    const handlePhotoChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        showNotification('File size must be less than 2MB', 'error')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error')
        return
      }

      try {
        const response = await FileAPI.upload(file, true) // Upload as private file
        
        if (response.success) {
          editForm.person_photo = response.data.file_url
          showNotification('Photo uploaded successfully', 'success')
        } else {
          throw new Error(response.error || 'Failed to upload photo')
        }

      } catch (err) {
        console.error('Failed to upload photo:', err)
        showNotification(err.message || 'Failed to upload photo', 'error')
      }
    }

    const handleDeliveryNoteChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error')
        return
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        showNotification('Please select a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG)', 'error')
        return
      }

      try {
        const response = await FileAPI.upload(file, true) // Upload as private file
        
        if (response.success) {
          deliveryForm.delivery_note = response.data.file_url
          showNotification('Delivery note uploaded successfully', 'success')
        } else {
          throw new Error(response.error || 'Failed to upload delivery note')
        }

      } catch (err) {
        console.error('Failed to upload delivery note:', err)
        showNotification(err.message || 'Failed to upload delivery note', 'error')
      }
    }

    const getFileName = (filePath) => {
      if (!filePath) return ''
      return filePath.split('/').pop()
    }

    const deleteIssue = () => {
      showDeleteConfirm.value = true
    }

    const confirmDelete = async () => {
      try {
        deleting.value = true

        const response = await GiftIssueAPI.delete(issue.name)
        
        if (response.success) {
          showNotification('Gift issue deleted successfully', 'success')
          router.push('/issues')
        } else {
          throw new Error(response.error || 'Failed to delete dispatch')
        }

      } catch (err) {
        console.error('Failed to delete dispatch:', err)
        showNotification(err.message || 'Failed to delete dispatch', 'error')
      } finally {
        deleting.value = false
        showDeleteConfirm.value = false
      }
    }

    const updateDeliveryStatus = async () => {
      // Clear previous errors
      Object.keys(deliveryErrors).forEach(key => delete deliveryErrors[key])
      
      // Validate form
      if (!deliveryForm.delivery_date) {
        deliveryErrors.delivery_date = 'Delivery date is required'
        return
      }

      try {
        updatingDelivery.value = true

        const response = await GiftIssueAPI.updateDeliveryStatus(
          issue.name,
          'Delivered',
          deliveryForm.delivery_note,
          deliveryForm.delivery_description,
          deliveryForm.delivery_date
        )
        
        if (response.success) {
          // Update local issue data
          issue.status = 'Delivered'
          issue.delivery_date = deliveryForm.delivery_date
          issue.delivery_note = deliveryForm.delivery_note
          issue.delivery_description = deliveryForm.delivery_description
          
          showDeliveryModal.value = false
          resetDeliveryForm()
          showNotification('Delivery status updated successfully', 'success')
        } else {
          throw new Error(response.error || 'Failed to update delivery status')
        }

      } catch (err) {
        console.error('Failed to update delivery status:', err)
        showNotification(err.message || 'Failed to update delivery status', 'error')
      } finally {
        updatingDelivery.value = false
      }
    }

    const cancelDeliveryUpdate = () => {
      showDeliveryModal.value = false
      resetDeliveryForm()
    }

    const resetDeliveryForm = () => {
      deliveryForm.delivery_date = new Date().toISOString().split('T')[0] // Today's date
      deliveryForm.delivery_note = ''
      deliveryForm.delivery_description = ''
      Object.keys(deliveryErrors).forEach(key => delete deliveryErrors[key])
    }

    const copyToClipboard = async (text, label) => {
      try {
        await navigator.clipboard.writeText(text)
        showNotification(`${label} copied to clipboard`, 'success')
      } catch (error) {
        showNotification(`Failed to copy ${label.toLowerCase()}`, 'error')
      }
    }

    const copyIssueDetails = async () => {
      const ownerName = getOwnerFullName()
      const coordinatorName = getCoordinatorFullName()
      const details = `
Gift Dispatch Details:
Owner: ${ownerName}
Coordinator: ${coordinatorName}
Emirates ID: ${issue.emirates_id}
Mobile: ${issue.mobile_number || 'N/A'}
Gift: ${issue.gift}
Category: ${formatCategory(issue.category)}
Dispatch Date: ${formatDate(issue.date)}
Dispatch ID: ${issue.name}
      `.trim()

      await copyToClipboard(details, 'Dispatch details')
    }

    const callRecipient = () => {
      if (issue.mobile_number) {
        window.open(`tel:${issue.mobile_number}`)
      }
    }

    const handleImageError = (event) => {
      // Hide the broken image and show the fallback icon
      event.target.style.display = 'none'
      const parent = event.target.parentElement
      if (parent) {
        const userIcon = parent.querySelector('svg')
        if (userIcon) {
          userIcon.style.display = 'block'
        }
      }
    }

    const getFullImageUrl = (imagePath) => {
      if (!imagePath) return ''
      
      // If it's already a full URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      
      // Handle private files
      if (imagePath.startsWith('/private/') || imagePath.startsWith('private/')) {
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
        return `/api/method/frappe.core.doctype.file.file.download_file?file_url=${cleanPath}`
      }
      
      // Handle public files
      if (imagePath.startsWith('/files/') || imagePath.startsWith('files/')) {
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
        return cleanPath
      }
      
      // Default case
      return `/files/${imagePath}`
    }

    // Helper functions for name formatting
    const getOwnerFullName = () => {
      return issue.owner_full_name || 'N/A'
    }

    const getCoordinatorFullName = () => {
      return issue.coordinator_full_name || 'N/A'
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
        minute: '2-digit'
      })
    }

    const formatTimeAgo = (date) => {
      if (!date) return ''
      
      const now = new Date()
      const past = new Date(date)
      const diffInMs = now - past
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      
      if (diffInMinutes < 1) {
        return 'Just now'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
      } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
      } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
      } else {
        return formatDate(date)
      }
    }

    // Dispatch More Gifts functionality
    const loadAvailableGifts = async () => {
      try {
        loadingAvailableGifts.value = true
        
        const response = await GiftAPI.list({ status: 'Available' }, 1, 100)
        
        if (response.success) {
          availableGifts.value = response.data || []
        } else {
          throw new Error(response.error || 'Failed to load available gifts')
        }

      } catch (err) {
        console.error('Failed to load available gifts:', err)
        showNotification(err.message || 'Failed to load available gifts', 'error')
      } finally {
        loadingAvailableGifts.value = false
      }
    }

    const filteredAvailableGifts = computed(() => {
      if (!giftSearchQuery.value) {
        return availableGifts.value
      }
      
      const query = giftSearchQuery.value.toLowerCase()
      return availableGifts.value.filter(gift => 
        gift.gift_name?.toLowerCase().includes(query) ||
        gift.gift_id?.toLowerCase().includes(query) ||
        gift.barcode_value?.toLowerCase().includes(query) ||
        gift.category?.toLowerCase().includes(query)
      )
    })

    const selectGiftForDispatch = async (gift) => {
      try {
        // Show confirmation dialog
        const ownerName = getOwnerFullName()
        const confirmed = confirm(
          `Are you sure you want to dispatch "${gift.gift_name}" to ${ownerName}?\n\n` +
          `This will create a new dispatch entry with the same recipient details.`
        )
        
        if (!confirmed) {
          return
        }

        dispatchingMoreGift.value = true

        // Create new dispatch with the same recipient details
        const dispatchData = {
          gift: gift.name,
          owner_full_name: issue.owner_full_name,
          owner_full_name: issue.owner_full_name,
          coordinator_full_name: issue.coordinator_full_name,
          coordinator_full_name: issue.coordinator_full_name,
          emirates_id: issue.emirates_id,
          mobile_number: issue.mobile_number,
          address: issue.address,
          person_photo: issue.person_photo,
          date: new Date().toISOString().split('T')[0] // Today's date
        }

        const response = await GiftIssueAPI.create(dispatchData)
        
        if (response.success) {
          const successMessage = `✅ Gift "${gift.gift_name}" has been successfully dispatched to ${ownerName}. Redirecting to new dispatch details...`
          
          showNotification(successMessage, 'success')
          showDispatchMoreModal.value = false
          
          // Wait a moment for the user to read the message, then redirect
          setTimeout(() => {
            const newDispatchId = response.data.name
            if (newDispatchId) {
              router.push(`/issues/${newDispatchId}`)
            }
          }, 2000) // 2 second delay
          
        } else {
          throw new Error(response.error || 'Failed to dispatch gift')
        }

      } catch (err) {
        console.error('Failed to dispatch gift:', err)
        showNotification(err.message || 'Failed to dispatch gift', 'error')
      } finally {
        dispatchingMoreGift.value = false
      }
    }

    const cancelDispatchMore = () => {
      showDispatchMoreModal.value = false
      giftSearchQuery.value = ''
    }

    // Watch for dispatch more modal opening to load gifts
    watch(showDispatchMoreModal, (newVal) => {
      if (newVal) {
        loadAvailableGifts()
      }
    })

    // Lifecycle
    onMounted(() => {
      loadIssue()
      
      // Initialize delivery form with today's date
      resetDeliveryForm()
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (event) => {
        if (!event.target.closest('.relative') || event.target.closest('.fixed')) {
          showActionsDropdown.value = false
        }
      })
    })

    return {
      loading,
      error,
      issue,
      imageLoaded,
      showEditForm,
      showDeleteConfirm,
      showDeliveryModal,
      showDispatchMoreModal,
      saving,
      deleting,
      updatingDelivery,
      showActionsDropdown,
      
      // Dispatch More Gifts
      loadingAvailableGifts,
      availableGifts,
      giftSearchQuery,
      filteredAvailableGifts,
      dispatchingMoreGift,
      
      editForm,
      errors,
      deliveryForm,
      deliveryErrors,
      saveChanges,
      cancelEdit,
      handlePhotoChange,
      handleDeliveryNoteChange,
      getFileName,
      deleteIssue,
      confirmDelete,
      updateDeliveryStatus,
      cancelDeliveryUpdate,
      copyToClipboard,
      copyIssueDetails,
      callRecipient,
      getFullImageUrl,
      handleImageError,
      getOwnerFullName,
      getCoordinatorFullName,
      formatCategory,
      formatDate,
      formatDateTime,
      formatTimeAgo,
      
      // Dispatch More Gifts Methods
      loadAvailableGifts,
      selectGiftForDispatch,
      cancelDispatchMore
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
}

/* Mobile header actions */
.mobile-header {
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}

/* Dropdown positioning */
.actions-dropdown {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Smooth dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

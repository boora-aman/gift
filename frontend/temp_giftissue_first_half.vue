<template>
  <div class="min-h-screen bg-desert-sand-50 pb-safe">
    <!-- Simple Header with Back Button -->
    <div class="absolute top-4 left-4 z-10">
      <button
        @click="$router.push('/scan')"
        class="p-3 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-600 hover:bg-white hover:text-charcoal-900 transition-colors shadow-lg"
      >
        <ArrowLeftIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-card p-6 text-center">
        <ArrowPathIcon class="w-8 h-8 mx-auto mb-4 animate-spin text-gray-700" />
        <p class="text-charcoal-600">Loading gift details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-xl shadow-card p-6 text-center">
        <div v-if="error.includes('already been issued')" class="mb-4">
          <InformationCircleIcon class="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 class="text-lg font-semibold text-charcoal-900 mb-2">Gift Already Issued</h3>
        </div>
        <div v-else class="mb-4">
          <ExclamationTriangleIcon class="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 class="text-lg font-semibold text-charcoal-900 mb-2">Unable to Issue Gift</h3>
        </div>
        <p class="text-charcoal-600 mb-4">{{ error }}</p>
        <div class="flex flex-col sm:flex-row justify-center gap-3">
          <button
            @click="loadGiftDetails"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
          <!-- Show Add Interest button only when gift is already issued -->
          <button
            v-if="error.includes('already been issued')"
            @click="showAddInterest = true"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Add Interest
          </button>
          <button
            @click="$router.push('/scanner')"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Scan Another Gift
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">

      <!-- Gift Details (Read-only) -->
      <div class="bg-white rounded-xl shadow-card p-6">
        <h2 class="text-xl font-semibold text-charcoal-900 mb-6">Gift Details</h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Gift Image -->
          <div class="lg:col-span-1">
            <div class="aspect-square rounded-lg overflow-hidden bg-charcoal-100">
              <img
                v-if="gift.images && gift.images.length > 0"
                :src="gift.images[0].image"
                :alt="gift.gift_name"
                class="w-full h-full object-contain"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <GiftIcon class="w-16 h-16 text-charcoal-400" />
              </div>
            </div>
          </div>

            <!-- Gift Information Table -->
            <div class="lg:col-span-2">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-2xl font-bold text-charcoal-900">{{ gift.gift_name }}</h3>
                <button
                  v-if="gift.additional_attributes && gift.additional_attributes.length > 0"
                  @click="showAdditionalDetails = true"
                  class="text-sm text-gray-700 hover:text-gray-800 font-medium flex items-center"
                >
                  <InformationCircleIcon class="w-4 h-4 mr-1" />
                  View Details
                </button>
              </div>

              <p v-if="gift.description" class="text-charcoal-600 mb-4">{{ gift.description }}</p>

              <div class="bg-charcoal-50 rounded-lg p-4">
                <table class="w-full">
                  <tbody class="space-y-2">
                    <tr class="border-b border-charcoal-200 last:border-b-0">
                      <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Category</td>
                      <td class="py-2 text-charcoal-900 capitalize">{{ gift.category }}</td>
                    </tr>
                    <tr class="border-b border-charcoal-200 last:border-b-0">
                      <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Gift Code</td>
                      <td class="py-2 text-charcoal-900 font-mono">{{ gift.barcode_value }}</td>
                    </tr>
                    <tr>
                      <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Status</td>
                      <td class="py-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {{ gift.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>

      <!-- Action Selection (when gift is available) -->
      <div v-if="!selectedAction" class="bg-white rounded-xl shadow-card p-4">
        <h3 class="text-lg font-medium text-charcoal-900 mb-4 text-center">Choose Action</h3>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="selectAction('dispatch')"
            class="flex items-center justify-center px-4 py-3 border-2 border-charcoal-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all duration-200 min-h-[44px] touch-manipulation"
          >
            <GiftIcon class="w-5 h-5 mr-2 text-gray-600" />
            <span class="text-sm font-medium text-charcoal-900">Gift Dispatch</span>
          </button>
          
          <button
            @click="selectAction('interest')"
            class="flex items-center justify-center px-4 py-3 border-2 border-charcoal-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all duration-200 min-h-[44px] touch-manipulation"
          >
            <DocumentTextIcon class="w-5 h-5 mr-2 text-gray-600" />
            <span class="text-sm font-medium text-charcoal-900">Add Interest</span>
          </button>
        </div>
      </div>

      <!-- Back to Action Selection (when action is selected) -->
      <div v-if="selectedAction && selectedAction === 'dispatch'" class="bg-white rounded-xl shadow-card p-4">
        <button
          @click="selectedAction = ''"
          class="flex items-center text-charcoal-600 hover:text-charcoal-800 transition-colors min-h-[44px] touch-manipulation"
        >
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          Back to Action Selection
        </button>
      </div>

      <!-- Person Details Form -->
      <form v-if="selectedAction === 'dispatch'" @submit.prevent="submitGiftIssue" class="space-y-8">

        <!-- Basic Information -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-charcoal-900">Person Details</h2>
            <button
              type="button"
              @click="showEmiratesIdScanner = true"
              class="flex items-center px-3 py-2 text-sm bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors"
            >
              <DocumentTextIcon class="w-4 h-4 mr-2" />
              Scan Emirates ID Document
            </button>
          </div>

          <!-- Recipient Selection Section -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Recipient Information</h3>
            
            <!-- Recipient Selection Mode -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-charcoal-700 mb-3">
                How would you like to add recipient information?
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="recipientMode = 'existing'"
                  :class="[
                    'flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 min-h-[56px]',
                    recipientMode === 'existing' 
                      ? 'border-gray-500 bg-gray-50 text-gray-900' 
                      : 'border-charcoal-200 hover:border-gray-400 text-charcoal-700'
                  ]"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Select Existing Recipient
                </button>
                
                <button
                  type="button"
                  @click="recipientMode = 'new'"
                  :class="[
                    'flex items-center justify-center p-4 border-2 rounded-lg transition-all duration-200 min-h-[56px]',
                    recipientMode === 'new' 
                      ? 'border-gray-500 bg-gray-50 text-gray-900' 
                      : 'border-charcoal-200 hover:border-gray-400 text-charcoal-700'
                  ]"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Create New Recipient
                </button>
              </div>
            </div>

            <!-- Existing Recipient Selection -->
            <div v-if="recipientMode === 'existing'" class="mb-6">
              <label class="block text-sm font-medium text-charcoal-700 mb-2">
                Search and Select Recipient <span class="text-red-500">*</span>
              </label>
              <div class="relative recipient-search-container">
                <input
                  v-model="recipientSearch"
                  @input="searchRecipients"
                  @focus="showRecipientDropdown = true"
                  type="text"
                  placeholder="Search by name, mobile number, or Emirates ID..."
                  class="w-full px-4 py-3 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  :class="{ 'border-red-500': errors.selectedRecipient && recipientMode === 'existing' }"
                />
                
                <!-- Clear Selected Recipient -->
                <button
                  v-if="selectedRecipient"
                  type="button"
                  @click="clearSelectedRecipient"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                >
                  <XMarkIcon class="w-5 h-5" />
                </button>
                
                <!-- Recipient Dropdown -->
                <div v-if="showRecipientDropdown && searchResults.length > 0 && !selectedRecipient" 
                     class="absolute z-20 w-full mt-1 bg-white border border-charcoal-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    v-for="recipient in searchResults"
                    :key="recipient.name"
                    @click="selectRecipient(recipient)"
                    class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div class="font-medium text-charcoal-900">{{ recipient.owner_full_name }}</div>
                    <div class="text-sm text-charcoal-600">Coordinator: {{ recipient.coordinator_full_name }}</div>
                    <div class="text-sm text-charcoal-500">{{ recipient.coordinator_mobile_no }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Selected Recipient Info -->
              <div v-if="selectedRecipient" class="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-green-900">{{ selectedRecipient.owner_full_name }}</div>
                    <div class="text-sm text-green-700">Coordinator: {{ selectedRecipient.coordinator_full_name }}</div>
                    <div class="text-sm text-green-600">{{ selectedRecipient.coordinator_mobile_no }}</div>
                  </div>
                  <button
                    type="button"
                    @click="clearSelectedRecipient"
                    class="text-green-600 hover:text-green-800"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <p v-if="errors.selectedRecipient && recipientMode === 'existing'" class="mt-2 text-sm text-red-600">
                {{ errors.selectedRecipient }}
              </p>
            </div>

            <!-- Create New Recipient Button -->
            <div v-if="recipientMode === 'new'" class="mb-6">
              <button
                type="button"
                @click="showCreateRecipientModal = true"
                class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-all duration-200"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Click to Create New Recipient
              </button>
              
              <!-- New Recipient Created Info -->
              <div v-if="newlyCreatedRecipient" class="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-blue-900">{{ newlyCreatedRecipient.owner_full_name }}</div>
                    <div class="text-sm text-blue-700">Coordinator: {{ newlyCreatedRecipient.coordinator_full_name }}</div>
                    <div class="text-sm text-blue-600">{{ newlyCreatedRecipient.coordinator_mobile_no }}</div>
                  </div>
                  <button
                    type="button"
                    @click="editNewRecipient"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
              
              <p v-if="errors.newRecipient && recipientMode === 'new'" class="mt-2 text-sm text-red-600">
                {{ errors.newRecipient }}
              </p>
            </div>
          </div>

          <!-- Manual Form Fields (only shown if no recipient selected or in new mode) -->
          <div v-if="recipientMode === 'new' && !newlyCreatedRecipient || recipientMode === 'existing' && !selectedRecipient" class="space-y-6">

          <!-- Owner Details Section -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Owner Details</h3>
            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="owner_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                  Owner Full Name *
                </label>
                <input
                  id="owner_full_name"
                  v-model="form.owner_full_name"
                  type="text"
                  required
                  :readonly="!!selectedRecipient"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Enter owner full name"
                />
                <p v-if="errors.owner_full_name" class="mt-1 text-sm text-red-600">{{ errors.owner_full_name }}</p>
              </div>
            </div>
          </div>

          <!-- Coordinator Details Section -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Coordinator Details</h3>
            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="coordinator_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                  Coordinator Full Name *
                </label>
                <input
                  id="coordinator_full_name"
                  v-model="form.coordinator_full_name"
                  type="text"
                  required
                  :readonly="!!selectedRecipient"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="Enter coordinator full name"
                />
                <p v-if="errors.coordinator_full_name" class="mt-1 text-sm text-red-600">{{ errors.coordinator_full_name }}</p>
              </div>
            </div>
          </div>

          <!-- Personal Information Section -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Contact Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="mobile_number" class="block text-sm font-medium text-charcoal-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  id="mobile_number"
                  v-model="form.mobile_number"
                  type="tel"
                  required
                  :readonly="!!selectedRecipient"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="+971 50 123 4567"
                />
                <p v-if="errors.mobile_number" class="mt-1 text-sm text-red-600">{{ errors.mobile_number }}</p>
              </div>

              <div>
                <label for="emirates_id" class="block text-sm font-medium text-charcoal-700 mb-2">
                  Emirates ID (Optional)
                </label>
                <input
                  id="emirates_id"
                  v-model="form.emirates_id"
                  type="text"
                  pattern="[0-9]{3}-[0-9]{4}-[0-9]{7}-[0-9]{1}"
                  :readonly="!!selectedRecipient"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="784-1234-1234567-1"
                />
                <p v-if="errors.emirates_id" class="mt-1 text-sm text-red-600">{{ errors.emirates_id }}</p>
              </div>
            </div>
          </div>

          <!-- Address Field -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Additional Information</h3>
            <div>
              <label for="address" class="block text-sm font-medium text-charcoal-700 mb-2">
                Address (Optional)
              </label>
              <textarea
                id="address"
                v-model="form.address"
                rows="3"
                :readonly="!!selectedRecipient"
                class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-vertical disabled:bg-gray-50"
                placeholder="Enter full address"
              ></textarea>
              <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
            </div>
          </div>
        </div>

        <!-- Photo Capture -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <h2 class="text-xl font-semibold text-charcoal-900 mb-6">Person Photo</h2>

          <!-- Photo Display -->
          <div class="mb-6">
            <div v-if="capturedPhoto || form.person_photo" class="relative inline-block">
              <img
                :src="capturedPhoto || form.person_photo"
                alt="Person photo"
                class="w-32 h-32 rounded-lg object-cover border-2 border-charcoal-200"
              />
              <button
                type="button"
                @click="clearPhoto"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
            <div v-else class="w-32 h-32 border-2 border-dashed border-charcoal-300 rounded-lg flex items-center justify-center bg-charcoal-50">
              <CameraIcon class="w-8 h-8 text-charcoal-400" />
            </div>
          </div>

          <!-- Photo Actions -->
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              @click="openCamera"
              class="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <CameraIcon class="w-4 h-4 mr-2" />
              Take Photo
            </button>
            <button
              type="button"
              @click="openGallery"
              class="flex items-center px-4 py-2 bg-charcoal-600 text-white rounded-lg hover:bg-charcoal-700 transition-colors"
            >
              <PhotoIcon class="w-4 h-4 mr-2" />
              Choose from Gallery
            </button>
          </div>

          <!-- Hidden file input for gallery -->
          <input
            ref="galleryInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleGalleryPhoto"
          />
        </div>

        <!-- Documents Section -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-charcoal-900">Other Documents</h2>
            <button
              type="button"
              @click="addDocument"
              class="flex items-center px-3 py-2 text-sm bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors"
            >
              <DocumentPlusIcon class="w-4 h-4 mr-2" />
              Add Document
            </button>
          </div>

          <!-- Documents List -->
          <div v-if="form.documents && form.documents.length > 0" class="space-y-4">
            <div
              v-for="(document, index) in form.documents"
              :key="index"
              class="border border-charcoal-200 rounded-lg p-4"
            >
              <!-- Single Row Layout for Document Type, Attachment, and Description -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end mb-3">
                <div class="lg:col-span-3">
                  <label class="block text-sm font-medium text-charcoal-700 mb-2">
                    Document Type *
                  </label>
                  <select
                    v-model="document.document_type"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Emirates ID Front">Emirates ID Front</option>
                    <option value="Emirates ID Back">Emirates ID Back</option>
                    <option value="Passport">Passport</option>
                    <option value="Visa">Visa</option>
                    <option value="Employment Letter">Employment Letter</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div class="lg:col-span-3">
                  <label class="block text-sm font-medium text-charcoal-700 mb-2">
                    Document File *
                  </label>
                  <div class="flex items-center space-x-2">
                    <input
                      type="file"
                      :id="`document_file_${index}`"
                      :ref="`documentInput_${index}`"
                      accept="image/*,.pdf,.doc,.docx"
                      class="hidden"
                      @change="handleDocumentUpload($event, index)"
                    />
                    <button
                      type="button"
                      @click="$refs[`documentInput_${index}`][0].click()"
                      class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors"
                    >
                      {{ document.document_attachment ? 'Change File' : 'Choose File' }}
                    </button>
                  </div>
                  <p v-if="document.document_attachment" class="mt-1 text-xs text-green-600">
                    File uploaded successfully
                  </p>
                </div>

                <div class="lg:col-span-4">
                  <label class="block text-sm font-medium text-charcoal-700 mb-2">
                    Description
                  </label>
                  <input
                    v-model="document.description"
                    type="text"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Optional description"
                  />
                </div>

                <div class="lg:col-span-2 flex justify-end">
                  <button
                    type="button"
                    @click="removeDocument(index)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Document"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Document Preview -->
              <div v-if="document.document_attachment" class="mt-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <DocumentTextIcon class="w-8 h-8 text-blue-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-charcoal-900 truncate">
                      {{ document.fileName || 'Document' }}
                    </p>
                    <p class="text-xs text-charcoal-500">
                      {{ document.document_type || 'Document type not specified' }}
                    </p>
                  </div>
                  <div class="flex-shrink-0">
                    <button
                      type="button"
                      @click="viewDocument(document)"
                      class="px-3 py-1 text-xs bg-charcoal-100 text-charcoal-700 rounded-md hover:bg-charcoal-200 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8 border-2 border-dashed border-charcoal-300 rounded-lg">
            <DocumentTextIcon class="w-12 h-12 mx-auto text-charcoal-400 mb-4" />
            <p class="text-charcoal-600 mb-4">No documents added yet</p>
            <button
              type="button"
              @click="addDocument"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Add First Document
            </button>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex justify-center pt-6 pb-20 sm:pb-6">
          <button
            type="submit"
            :disabled="submitting"
            class="w-full sm:w-auto px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting" class="flex items-center justify-center">
              <ArrowPathIcon class="w-4 h-4 mr-2 animate-spin" />
              Issuing Gift...
            </span>
            <span v-else>Dispatch Gift</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Create Recipient Modal -->
    <CreateRecipientModal
      :show="showCreateRecipientModal"
      :edit-data="newlyCreatedRecipient"
      @close="showCreateRecipientModal = false"
      @created="handleRecipientCreated"
    />

    <!-- Success Modal -->
    <GiftIssueSuccessModal
      v-if="showSuccessModal"
      @close="handleSuccessModalClose"
      @issue-another="handleIssueAnother"
    />

    <!-- Camera Modal -->
    <CameraModal
      v-if="showCamera"
      @close="showCamera = false"
      @photo-captured="handleCapturedPhoto"
    />

    <!-- Emirates ID Scanner Modal -->
    <EmiratesIdScanner
      v-if="showEmiratesIdScanner"
      @close="showEmiratesIdScanner = false"
      @data-extracted="handleEmiratesIdData"
    />

    <!-- Add Interest Modal -->
    <InterestForm
      :show="showAddInterest"
      :gift-id="gift.name || route.params.id"
      @close="handleInterestClose"
      @success="handleInterestSuccess"
    />

    <!-- Additional Details Modal -->
    <div
      v-if="showAdditionalDetails"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-charcoal-900">
            Additional Gift Details
          </h3>
          <button
            @click="showAdditionalDetails = false"
            class="p-2 text-charcoal-500 hover:text-charcoal-700 rounded-lg hover:bg-charcoal-100 transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Gift Images -->
          <div v-if="gift.images && gift.images.length > 1">
            <h4 class="font-medium text-charcoal-900 mb-3">Gift Images</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div
                v-for="(image, index) in gift.images"
                :key="index"
                class="aspect-square rounded-lg overflow-hidden bg-charcoal-100"
              >
                <img
                  :src="image.image"
                  :alt="`Gift image ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <!-- Additional Attributes -->
          <div v-if="gift.additional_attributes && gift.additional_attributes.length > 0">
            <h4 class="font-medium text-charcoal-900 mb-3">Additional Attributes</h4>
            <div class="bg-charcoal-50 rounded-lg p-4">
              <table class="w-full">
                <tbody>
                  <tr
                    v-for="attr in gift.additional_attributes"
                    :key="attr.attribute_name"
                    class="border-b border-charcoal-200 last:border-b-0"
                  >
                    <td class="py-3 text-sm font-medium text-charcoal-600 w-1/3">{{ attr.attribute_name }}</td>
                    <td class="py-3 text-charcoal-900">{{ attr.attribute_value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Gift Metadata -->
          <div>
            <h4 class="font-medium text-charcoal-900 mb-3">Gift Information</h4>
            <div class="bg-charcoal-50 rounded-lg p-4">
              <table class="w-full">
                <tbody>
                  <tr class="border-b border-charcoal-200">
                    <td class="py-3 text-sm font-medium text-charcoal-600 w-1/3">Created</td>
                    <td class="py-3 text-charcoal-900">{{ formatDate(gift.creation) }}</td>
                  </tr>
                  <tr class="border-b border-charcoal-200">
                    <td class="py-3 text-sm font-medium text-charcoal-600 w-1/3">Last Modified</td>
                    <td class="py-3 text-charcoal-900">{{ formatDate(gift.modified) }}</td>
                  </tr>
                  <tr>
                    <td class="py-3 text-sm font-medium text-charcoal-600 w-1/3">Created By</td>
                    <td class="py-3 text-charcoal-900">{{ gift.owner }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="showAdditionalDetails = false"
            class="px-4 py-2 bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


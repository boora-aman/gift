<template>
  <div class="min-h-screen bg-desert-sand-50 pb-safe">
    <!-- Simple Header with Back Button -->
    <div class="absolute top-4 left-4 z-10">
      <button @click="handleBackButton"
        class="p-3 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-600 hover:bg-white hover:text-charcoal-900 transition-colors shadow-lg">
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
          <button @click="loadGiftDetails"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Refresh
          </button>
          <!-- Show Add Interest button only when gift is already issued -->
          <button v-if="error.includes('already issued')" @click="showAddInterest = true"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Add Interest
          </button>
          <button @click="$router.push('/scanner')"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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
              <img v-if="gift.images && gift.images.length > 0" :src="gift.images[0].image" :alt="gift.gift_name"
                class="w-full h-full object-contain" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <GiftIcon class="w-16 h-16 text-charcoal-400" />
              </div>
            </div>
          </div>

          <!-- Gift Information Table -->
          <div class="lg:col-span-2">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-bold text-charcoal-900">{{ gift.gift_name }}</h3>
              <button v-if="gift.additional_attributes && gift.additional_attributes.length > 0"
                @click="showAdditionalDetails = true"
                class="text-sm text-gray-700 hover:text-gray-800 font-medium flex items-center">
                <InformationCircleIcon class="w-4 h-4 mr-1" />
                View Details
              </button>
            </div>

            <p v-if="gift.description" class="text-charcoal-600 mb-4">{{ gift.description }}</p>

            <div class="bg-charcoal-50 rounded-lg p-4">
              <table class="w-full">
                <tbody class="space-y-2">
                  <tr class="border-b border-charcoal-200 last:border-b-0">
                    <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Category (النوع)</td>
                    <td class="py-2 text-charcoal-900 capitalize">{{ gift.category || 'N/A' }}</td>
                  </tr>
                  <tr class="border-b border-charcoal-200 last:border-b-0">
                    <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">UAE Ring (رقم الحلقة)</td>
                    <td class="py-2 text-charcoal-900 font-mono">{{ gift.gift_id || 'N/A' }}</td>
                  </tr>
                  <tr  class="border-b border-charcoal-200 last:border-b-0">
                    <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Gender (الجنس)</td>
                    <td class="py-2 text-charcoal-900">{{ gift.gender }}</td>
                  </tr>
                  <tr class="border-b border-charcoal-200 last:border-b-0">
                    <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Breed (الجبر)</td>
                    <td class="py-2 text-charcoal-900">{{ gift.breed }}</td>
                  </tr>
                  <tr class="border-b border-charcoal-200 last:border-b-0">
                    <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Weight (الوزن)</td>
                    <td class="py-2 text-charcoal-900">{{ gift.weight }}</td>
                  </tr>
                  <tr class="border-b border-charcoal-200 last:border-b-0">
                    <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Farm Name (المزرعة)</td>
                    <td class="py-2 text-charcoal-900">{{ gift.farm_name || 'N/A' }}</td>
                  </tr>
                  <tr class="border-b border-charcoal-200 last:border-b-0">
                    <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Gift Code</td>
                    <td class="py-2 text-charcoal-900 font-mono">{{ gift.barcode_value || 'N/A' }}</td>
                  </tr>
                  <tr>
                    <td class="py-2 text-sm font-medium text-charcoal-500 w-1/3">Status</td>
                    <td class="py-2">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
        
        <!-- Show message for Event Coordinators -->
        <div v-if="!authStore.canDispatchGifts" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-800 text-center">
            <strong>Event Coordinator:</strong> You can scan barcodes and add interests, but cannot dispatch gifts.
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <!-- Only show dispatch option for Admin and Event Manager -->
          <button v-if="authStore.canDispatchGifts" @click="selectAction('dispatch')"
            class="flex items-center justify-center px-4 py-3 border-2 border-charcoal-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all duration-200 min-h-[44px] touch-manipulation">
            <GiftIcon class="w-5 h-5 mr-2 text-gray-600" />
            <span class="text-sm font-medium text-charcoal-900">Gift Dispatch</span>
          </button>

          <button @click="selectAction('interest')"
            class="flex items-center justify-center px-4 py-3 border-2 border-charcoal-200 rounded-lg hover:border-gray-500 hover:bg-gray-50 transition-all duration-200 min-h-[44px] touch-manipulation">
            <DocumentTextIcon class="w-5 h-5 mr-2 text-gray-600" />
            <span class="text-sm font-medium text-charcoal-900">Add Interest</span>
          </button>
        </div>
      </div>

      <!-- Back to Action Selection (when action is selected and not from interest) -->
      <div v-if="selectedAction && selectedAction === 'dispatch' && !isFromInterest" class="bg-white rounded-xl shadow-card p-4">
        <button @click="selectedAction = ''"
          class="flex items-center text-charcoal-600 hover:text-charcoal-800 transition-colors min-h-[44px] touch-manipulation">
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
            <button type="button" @click="showEmiratesIdScanner = true"
              class="flex items-center px-3 py-2 text-sm bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors">
              <DocumentTextIcon class="w-4 h-4 mr-2" />
              Scan Emirates ID Document
            </button>
          </div>

          <!-- Recipient Selection Section -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Recipient
              Information</h3>

            <!-- Recipient Selection Mode -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-charcoal-700 mb-3">
                Choose how to add recipient information:
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button type="button" @click="recipientMode = 'existing'" :class="[
                  'flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 min-h-[64px] touch-manipulation relative overflow-hidden',
                  recipientMode === 'existing'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                    : 'border-charcoal-200 hover:border-blue-300 hover:bg-blue-25 text-charcoal-700'
                ]">
                  <div class="flex items-center">
                    <div class="mr-3 flex-shrink-0">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                        </path>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-semibold">Select Existing</div>
                      <div class="text-xs mt-1 opacity-75">Choose from saved recipients</div>
                    </div>
                  </div>
                  <!-- Selected indicator -->
                  <div v-if="recipientMode === 'existing'" class="absolute top-2 right-2">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </button>

                <button type="button" @click="recipientMode = 'new'" :class="[
                  'flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 min-h-[64px] touch-manipulation relative overflow-hidden',
                  recipientMode === 'new'
                    ? 'border-green-500 bg-green-50 text-green-900 shadow-md'
                    : 'border-charcoal-200 hover:border-green-300 hover:bg-green-25 text-charcoal-700'
                ]">
                  <div class="flex items-center">
                    <div class="mr-3 flex-shrink-0">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-semibold">Create New</div>
                      <div class="text-xs mt-1 opacity-75">Add new recipient details</div>
                    </div>
                  </div>
                  <!-- Selected indicator -->
                  <div v-if="recipientMode === 'new'" class="absolute top-2 right-2">
                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <!-- Existing Recipient Selection -->
            <div v-if="recipientMode === 'existing'" class="mb-6">
              <label class="block text-sm font-medium text-charcoal-700 mb-2">
                Search and Select Recipient <span class="text-red-500">*</span>
              </label>
              <div class="relative recipient-search-container">
                <input v-model="recipientSearch" @input="searchRecipients" @focus="showRecipientDropdown = true"
                  type="text" placeholder="Search by name, mobile number, or Emirates ID..."
                  class="w-full px-4 py-3 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  :class="{ 'border-red-500': errors.selectedRecipient && recipientMode === 'existing' }" />

                <!-- Clear Selected Recipient -->
                <button v-if="selectedRecipient" type="button" @click="clearSelectedRecipient"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600">
                  <XMarkIcon class="w-5 h-5" />
                </button>

                <!-- Recipient Dropdown -->
                <div v-if="showRecipientDropdown && searchResults.length > 0 && !selectedRecipient"
                  class="absolute z-20 w-full mt-1 bg-white border border-charcoal-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div v-for="recipient in searchResults" :key="recipient.name" @click="selectRecipient(recipient)"
                    class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
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
                  <button type="button" @click="clearSelectedRecipient" class="text-green-600 hover:text-green-800">
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
              <button type="button" @click="showCreateRecipientModal = true"
                class="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-all duration-200">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6">
                  </path>
                </svg>
                Click to Create New Recipient
              </button>

              <!-- New Recipient Created Info -->
              <div v-if="newlyCreatedRecipient" class="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium text-blue-900">{{ newlyCreatedRecipient.owner_full_name }}</div>
                    <div class="text-sm text-blue-700">Coordinator: {{ newlyCreatedRecipient.coordinator_full_name }}
                    </div>
                    <div class="text-sm text-blue-600">{{ newlyCreatedRecipient.coordinator_mobile_no }}</div>
                  </div>
                  <button type="button" @click="editNewRecipient"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Edit
                  </button>
                </div>
              </div>

              <p v-if="errors.newRecipient && recipientMode === 'new'" class="mt-2 text-sm text-red-600">
                {{ errors.newRecipient }}
              </p>
            </div>
          </div>

          <!-- Form Fields (always visible, readonly when recipient selected) -->
          <div class="space-y-6">

            <!-- Owner Details Section - Hidden -->
            <div class="mb-8" style="display: none;">
              <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Owner Details
              </h3>
              <div class="grid grid-cols-1 gap-6">
                <div>
                  <label for="owner_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Owner Full Name *
                  </label>
                  <input id="owner_full_name" v-model="form.owner_full_name" type="text" required
                    :readonly="!!selectedRecipient || !!newlyCreatedRecipient"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    :class="{ 'bg-gray-50': !!selectedRecipient || !!newlyCreatedRecipient }"
                    placeholder="Enter owner full name" />
                  <p v-if="errors.owner_full_name" class="mt-1 text-sm text-red-600">{{ errors.owner_full_name }}</p>
                </div>
              </div>
            </div>

            <!-- Coordinator Details Section - Hidden -->
            <div class="mb-8" style="display: none;">
              <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Coordinator
                Details</h3>
              <div class="grid grid-cols-1 gap-6">
                <div>
                  <label for="coordinator_full_name" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Coordinator Full Name *
                  </label>
                  <input id="coordinator_full_name" v-model="form.coordinator_full_name" type="text" required
                    :readonly="!!selectedRecipient || !!newlyCreatedRecipient"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    :class="{ 'bg-gray-50': !!selectedRecipient || !!newlyCreatedRecipient }"
                    placeholder="Enter coordinator full name" />
                  <p v-if="errors.coordinator_full_name" class="mt-1 text-sm text-red-600">{{
                    errors.coordinator_full_name }}</p>
                </div>
              </div>
            </div>

            <!-- Personal Information Section - Hidden -->
            <div class="mb-8" style="display: none;">
              <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Contact
                Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="mobile_number" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Mobile Number *
                  </label>
                  <input id="mobile_number" v-model="form.mobile_number" type="tel" required
                    :readonly="!!selectedRecipient || !!newlyCreatedRecipient"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    :class="{ 'bg-gray-50': !!selectedRecipient || !!newlyCreatedRecipient }" placeholder="" />
                  <p v-if="errors.mobile_number" class="mt-1 text-sm text-red-600">{{ errors.mobile_number }}</p>
                </div>

                <div>
                  <label for="emirates_id" class="block text-sm font-medium text-charcoal-700 mb-2">
                    Emirates ID (Optional)
                  </label>
                  <input id="emirates_id" v-model="form.emirates_id" type="text"
                    pattern="[0-9]{3}-[0-9]{4}-[0-9]{7}-[0-9]{1}"
                    :readonly="!!selectedRecipient || !!newlyCreatedRecipient"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    :class="{ 'bg-gray-50': !!selectedRecipient || !!newlyCreatedRecipient }" placeholder="" />
                  <p v-if="errors.emirates_id" class="mt-1 text-sm text-red-600">{{ errors.emirates_id }}</p>
                </div>
              </div>
            </div>

            <!-- Address Field - Hidden -->
            <div class="mb-6" style="display: none;">
              <h3 class="text-lg font-medium text-charcoal-800 mb-4 border-b border-charcoal-200 pb-2">Additional
                Information</h3>
              <div>
                <label for="address" class="block text-sm font-medium text-charcoal-700 mb-2">
                  Address (Optional)
                </label>
                <textarea id="address" v-model="form.address" rows="3"
                  :readonly="!!selectedRecipient || !!newlyCreatedRecipient"
                  class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-vertical"
                  :class="{ 'bg-gray-50': !!selectedRecipient || !!newlyCreatedRecipient }"
                  placeholder="Enter full address"></textarea>
                <p v-if="errors.address" class="mt-1 text-sm text-red-600">{{ errors.address }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Photo Capture -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <h2 class="text-xl font-semibold text-charcoal-900 mb-6">Person Photo</h2>

          <!-- Photo Display -->
          <div class="mb-6">
            <div v-if="capturedPhoto || form.person_photo" class="relative inline-block">
              <img :src="capturedPhoto || form.person_photo" alt="Person photo"
                class="w-32 h-32 rounded-lg object-cover border-2 border-charcoal-200" />
              <button type="button" @click="clearPhoto"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
            <div v-else
              class="w-32 h-32 border-2 border-dashed border-charcoal-300 rounded-lg flex items-center justify-center bg-charcoal-50">
              <CameraIcon class="w-8 h-8 text-charcoal-400" />
            </div>
          </div>

          <!-- Photo Actions -->
          <div class="flex flex-wrap gap-3">
            <button type="button" @click="openCamera"
              class="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <CameraIcon class="w-4 h-4 mr-2" />
              Take Photo
            </button>
            <button type="button" @click="openGallery"
              class="flex items-center px-4 py-2 bg-charcoal-600 text-white rounded-lg hover:bg-charcoal-700 transition-colors">
              <PhotoIcon class="w-4 h-4 mr-2" />
              Choose from Gallery
            </button>
          </div>

          <!-- Hidden file input for gallery -->
          <input ref="galleryInput" type="file" accept="image/*" class="hidden" @change="handleGalleryPhoto" />
        </div>

        <!-- Documents Section -->
        <div class="bg-white rounded-xl shadow-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-charcoal-900">Other Documents</h2>
            <button type="button" @click="addDocument"
              class="flex items-center px-3 py-2 text-sm bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors">
              <DocumentPlusIcon class="w-4 h-4 mr-2" />
              Add Document
            </button>
          </div>

          <!-- Documents List -->
          <div v-if="form.documents && form.documents.length > 0" class="space-y-4">
            <div v-for="(document, index) in form.documents" :key="index"
              class="border border-charcoal-200 rounded-lg p-4">
              <!-- Single Row Layout for Document Type, Attachment, and Description -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end mb-3">
                <div class="lg:col-span-3">
                  <label class="block text-sm font-medium text-charcoal-700 mb-2">
                    Document Type *
                  </label>
                  <select v-model="document.document_type"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required>
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
                    <input type="file" :id="`document_file_${index}`" :ref="`documentInput_${index}`"
                      accept="image/*,.pdf,.doc,.docx" class="hidden" @change="handleDocumentUpload($event, index)" />
                    <button type="button" @click="$refs[`documentInput_${index}`][0].click()"
                      class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-700 bg-white hover:bg-charcoal-50 transition-colors">
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
                  <input v-model="document.description" type="text"
                    class="w-full px-3 py-2 border border-charcoal-300 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Optional description" />
                </div>

                <div class="lg:col-span-2 flex justify-end">
                  <button type="button" @click="removeDocument(index)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Document">
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
                    <button type="button" @click="viewDocument(document)"
                      class="px-3 py-1 text-xs bg-charcoal-100 text-charcoal-700 rounded-md hover:bg-charcoal-200 transition-colors">
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
            <button type="button" @click="addDocument"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Add First Document
            </button>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex justify-center pt-6 pb-20 sm:pb-6">
          <button type="submit" :disabled="submitting"
            class="w-full sm:w-auto px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-600 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
    <CreateRecipientModal :show="showCreateRecipientModal" :edit-data="newlyCreatedRecipient"
      @close="showCreateRecipientModal = false" @created="handleRecipientCreated" />

    <!-- Success Modal -->
    <GiftIssueSuccessModal v-if="showSuccessModal" @close="handleSuccessModalClose"
      @issue-another="handleIssueAnother" />

    <!-- Camera Modal -->
    <CameraModal v-if="showCamera" @close="showCamera = false" @photo-captured="handleCapturedPhoto" />

    <!-- Emirates ID Scanner Modal -->
    <EmiratesIdScanner v-if="showEmiratesIdScanner" @close="showEmiratesIdScanner = false"
      @data-extracted="handleEmiratesIdData" />

    <!-- Add Interest Modal -->
    <InterestForm :show="showAddInterest" :gift-id="gift.name || route.params.id" @close="handleInterestClose"
      @success="handleInterestSuccess" />

    <!-- Additional Details Modal -->
    <div v-if="showAdditionalDetails"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm">
      <div class="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-charcoal-900">
            Additional Gift Details
          </h3>
          <button @click="showAdditionalDetails = false"
            class="p-2 text-charcoal-500 hover:text-charcoal-700 rounded-lg hover:bg-charcoal-100 transition-colors">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- Gift Images -->
          <div v-if="gift.images && gift.images.length > 1">
            <h4 class="font-medium text-charcoal-900 mb-3">Gift Images</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div v-for="(image, index) in gift.images" :key="index"
                class="aspect-square rounded-lg overflow-hidden bg-charcoal-100">
                <img :src="image.image" :alt="`Gift image ${index + 1}`" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <!-- Additional Attributes -->
          <div v-if="gift.additional_attributes && gift.additional_attributes.length > 0">
            <h4 class="font-medium text-charcoal-900 mb-3">Additional Attributes</h4>
            <div class="bg-charcoal-50 rounded-lg p-4">
              <table class="w-full">
                <tbody>
                  <tr v-for="attr in gift.additional_attributes" :key="attr.attribute_name"
                    class="border-b border-charcoal-200 last:border-b-0">
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
          <button @click="showAdditionalDetails = false"
            class="px-4 py-2 bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from '@composables/useNotifications'
import { useAuthStore } from '@stores/auth'
import { GiftAPI, GiftIssueAPI, FileAPI } from '@services/api'

// Icons
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  GiftIcon,
  CameraIcon,
  PhotoIcon,
  XMarkIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentPlusIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

// Components
import CameraModal from '@components/CameraModal.vue'
import EmiratesIdScanner from '@components/EmiratesIdScanner.vue'
import GiftIssueSuccessModal from '@components/GiftIssueSuccessModal.vue'
import InterestForm from '@components/InterestForm.vue'
import CreateRecipientModal from '@components/CreateRecipientModal.vue'

export default {
  name: 'GiftIssueFlow',
  components: {
    ArrowLeftIcon,
    ArrowPathIcon,
    GiftIcon,
    CameraIcon,
    PhotoIcon,
    XMarkIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    DocumentPlusIcon,
    TrashIcon,
    CameraModal,
    EmiratesIdScanner,
    GiftIssueSuccessModal,
    InterestForm,
    CreateRecipientModal
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { showNotification } = useNotifications()
    const authStore = useAuthStore()

    // State
    const loading = ref(true)
    const submitting = ref(false)
    const error = ref('')
    const gift = ref({})
    const showCamera = ref(false)
    const showEmiratesIdScanner = ref(false)
    const showAdditionalDetails = ref(false)
    const showSuccessModal = ref(false)
    const showAddInterest = ref(false)
    const selectedAction = ref('')
    const isFromInterest = ref(false) // Track if we came from interest
    const capturedPhoto = ref('')
    const galleryInput = ref(null)
    const errors = ref({})

    // Recipient search and management
    const recipientSearch = ref('')
    const searchResults = ref([])
    const showRecipientDropdown = ref(false)
    const selectedRecipient = ref(null)
    const recipientMode = ref('existing') // 'existing' or 'new'
    const showCreateRecipientModal = ref(false)
    const newlyCreatedRecipient = ref(null)

    const form = reactive({
      // Required fields - Updated to use full names
      owner_full_name: '',
      coordinator_full_name: '',
      mobile_number: '',

      // Optional fields
      emirates_id: '',
      address: '',

      // Gift details from the gift object
      uae_ring: '',
      farm_name: '',

      // Other fields
      person_photo: '',
      date: new Date().toISOString().split('T')[0],
      documents: [],
    })

    // Methods
    const selectAction = (action) => {
      selectedAction.value = action
      if (action === 'interest') {
        showAddInterest.value = true
      }
    }

    // Auto-select interest for Event Coordinators
    const autoSelectActionIfNeeded = () => {
      // If user can't dispatch gifts (i.e., Event Coordinator), auto-select interest
      if (!authStore.canDispatchGifts && gift.value.status === 'Available') {
        selectedAction.value = 'interest'
        showAddInterest.value = true
      }
    }

    const loadGiftDetails = async () => {
      try {
        loading.value = true
        error.value = ''

        const giftId = route.params.id
        if (!giftId) {
          throw new Error('Gift Code is required')
        }

        const result = await GiftAPI.getDetails(giftId)

        if (!result.success) {
          throw new Error(result.error || 'Failed to load gift details')
        }

        // The API returns { gift: {...}, issue_history: {...} }
        // We need to extract the gift data
        const giftData = result.data.gift || result.data

        // Debug logging
        // console.log('Gift API Response:', result.data)
        // console.log('Extracted Gift Data:', giftData)

        gift.value = giftData

        // Populate form fields with gift data
        form.uae_ring = giftData.gift_no || ''
        form.farm_name = giftData.farm_name || ''

        // Check if gift is still available
        if (gift.value.status !== 'Available') {
          let message = ``

          if (gift.value.status === 'Issued') {
            const issueDate = gift.value.issued_date || 'unknown date'
            const personName = `${gift.value.owner_full_name || ''}`.trim()
            message += `Gift ${giftId} is already issued to ${personName}`
            // For issued gifts, show as info instead of error
            showNotification(message, 'info')

            // Still set error to prevent form submission, but with a more friendly message
            error.value = `${message}`
          } else {
            // For other statuses (like Reserved, Damaged, etc.), show as error
            message += '. Only "Available" gifts can be issued.'
            throw new Error(message)
          }
        }

        // Auto-select action if needed (for Event Coordinators)
        autoSelectActionIfNeeded()

      } catch (err) {
        console.error('Failed to load gift details:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const openCamera = () => {
      showCamera.value = true
    }

    const openGallery = () => {
      galleryInput.value?.click()
    }

    const handleGalleryPhoto = async (event) => {
      const file = event.target.files[0]
      if (file) {
        await uploadPhoto(file)
      }
    }

    const handleCapturedPhoto = async (photoBlob) => {
      showCamera.value = false
      await uploadPhoto(photoBlob)
    }

    const uploadPhoto = async (file) => {
      try {
        // console.log('Starting photo upload...', file)

        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (e) => {
          capturedPhoto.value = e.target.result
          //   console.log('Photo preview set successfully')
        }
        reader.readAsDataURL(file)

        // Upload to server
        // console.log('Uploading to server...')
        const uploadResult = await FileAPI.upload(file, true) // Upload as private
        // console.log('Upload result:', uploadResult)

        if (uploadResult && uploadResult.success) {
          form.person_photo = uploadResult.data.file_url
          //   console.log('Photo URL saved:', uploadResult.data.file_url)
          showNotification('Photo uploaded successfully', 'success')
        } else {
          throw new Error(uploadResult?.error || 'Failed to upload photo')
        }

      } catch (err) {
        console.error('Photo upload error:', err)
        showNotification(`Failed to upload photo: ${err.message}`, 'error')
        // Keep the preview even if upload fails
        // capturedPhoto.value = ''
      }
    }

    const clearPhoto = () => {
      capturedPhoto.value = ''
      form.person_photo = ''
      if (galleryInput.value) {
        galleryInput.value.value = ''
      }
    }

    const handleEmiratesIdData = (data) => {
      showEmiratesIdScanner.value = false

      // Only update if not using selected recipient
      if (!selectedRecipient.value) {
        if (data.first_name && data.last_name) {
          form.owner_full_name = `${data.first_name} ${data.last_name}`.trim()
        }
        if (data.emirates_id) {
          form.emirates_id = data.emirates_id
        }
      }

      showNotification('Emirates ID data extracted successfully', 'success')
    }

    // Recipient search methods
    const searchRecipients = async () => {
      if (!recipientSearch.value || recipientSearch.value.length < 2) {
        searchResults.value = []
        showRecipientDropdown.value = false
        return
      }

      try {
        const response = await fetch('/api/method/gift.api_v2.search_recipients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Frappe-CSRF-Token': window.csrf_token || ''
          },
          body: JSON.stringify({
            search_term: recipientSearch.value,
            limit: 10
          })
        })

        const result = await response.json()
        if (result.message && result.message.success) {
          searchResults.value = result.message.data || []
          showRecipientDropdown.value = searchResults.value.length > 0
        } else {
          searchResults.value = []
          showRecipientDropdown.value = false
        }
      } catch (error) {
        console.error('Error searching recipients:', error)
        searchResults.value = []
        showRecipientDropdown.value = false
      }
    }

    const selectRecipient = (recipient) => {
      selectedRecipient.value = recipient
      recipientSearch.value = `${recipient.owner_full_name} - ${recipient.coordinator_full_name}`
      showRecipientDropdown.value = false

      // Populate form with recipient data
      form.owner_full_name = recipient.owner_full_name
      form.coordinator_full_name = recipient.coordinator_full_name
      form.mobile_number = recipient.coordinator_mobile_no
      form.emirates_id = recipient.coordinator_emirates_id || ''
      form.address = recipient.address || ''

      // Clear any errors
      delete errors.selectedRecipient
    }

    const clearSelectedRecipient = () => {
      selectedRecipient.value = null
      recipientSearch.value = ''

      // Clear form fields
      form.owner_full_name = ''
      form.coordinator_full_name = ''
      form.mobile_number = ''
      form.emirates_id = ''
      form.address = ''
    }

    // New recipient management methods
    const editNewRecipient = () => {
      showCreateRecipientModal.value = true
    }

    const handleRecipientCreated = (recipient) => {
      newlyCreatedRecipient.value = recipient
      showCreateRecipientModal.value = false

      // Populate form with new recipient data
      form.owner_full_name = recipient.owner_full_name
      form.coordinator_full_name = recipient.coordinator_full_name
      form.mobile_number = recipient.coordinator_mobile_no
      form.emirates_id = recipient.coordinator_emirates_id || ''
      form.address = recipient.address || ''

      // Clear any errors
      delete errors.newRecipient

      showNotification('Recipient created and selected successfully', 'success')
    }

    const clearNewRecipient = () => {
      newlyCreatedRecipient.value = null
      // Clear form fields
      form.owner_full_name = ''
      form.coordinator_full_name = ''
      form.mobile_number = ''
      form.emirates_id = ''
      form.address = ''
    }

    // Document methods
    const addDocument = () => {
      form.documents.push({
        document_type: '',
        document_attachment: '',
        description: ''
      })
    }

    const removeDocument = (index) => {
      form.documents.splice(index, 1)
    }

    const handleDocumentUpload = async (event, index) => {
      const file = event.target.files[0]
      if (!file) return

      try {
        // console.log('Uploading document...', file)

        // Upload to server
        const uploadResult = await FileAPI.upload(file, true) // Upload as private
        // console.log('Document upload result:', uploadResult)

        if (uploadResult && uploadResult.success) {
          form.documents[index].document_attachment = uploadResult.data.file_url
          form.documents[index].fileName = file.name
          //   console.log('Document URL saved:', uploadResult.data.file_url)
          showNotification('Document uploaded successfully', 'success')
        } else {
          throw new Error(uploadResult?.error || 'Failed to upload document')
        }

      } catch (err) {
        console.error('Document upload error:', err)
        showNotification(`Failed to upload document: ${err.message}`, 'error')
      }
    }

    const viewDocument = (document) => {
      if (document.document_attachment) {
        window.open(document.document_attachment, '_blank')
      }
    }

    const validateForm = async () => {
      errors.value = {}

      // Recipient mode validation - now required since form fields are hidden
      if (recipientMode.value === 'existing' && !selectedRecipient.value) {
        errors.value.selectedRecipient = 'Please select an existing recipient'
      }

      if (recipientMode.value === 'new' && !newlyCreatedRecipient.value) {
        errors.value.newRecipient = 'Please create a new recipient'
      }

      // Since form fields are hidden, recipient selection is required
      if (!selectedRecipient.value && !newlyCreatedRecipient.value) {
        if (recipientMode.value === 'existing') {
          errors.value.selectedRecipient = 'Please select an existing recipient'
        } else {
          errors.value.newRecipient = 'Please create a new recipient'
        }
      }

      return Object.keys(errors.value).length === 0
    }

    const submitGiftIssue = async () => {
      const isValid = await validateForm()
      if (!isValid) return

      try {
        submitting.value = true

        const issueData = {
          gift: gift.value.name,
          // Use Gift Recipient if selected
          gift_recipient: selectedRecipient.value?.name || null,
          // Required fields
          owner_full_name: form.owner_full_name,
          coordinator_full_name: form.coordinator_full_name,
          mobile_number: form.mobile_number,

          // Optional fields
          emirates_id: form.emirates_id,
          address: form.address,

          // Other fields
          person_photo: form.person_photo,
          date: form.date,
          documents: form.documents.filter(doc => doc.document_type && doc.document_attachment)
        }

        // Use the API service instead of direct fetch
        const result = await GiftIssueAPI.create(issueData)

        if (!result.success) {
          throw new Error(result.error || 'Failed to dispatch gift')
        }

        // Show success modal instead of redirect
        showSuccessModal.value = true

      } catch (err) {
        console.error('Failed to submit gift issue:', err)
        showNotification(err.message || 'Failed to dispatch gift', 'error')
      } finally {
        submitting.value = false
      }
    }

    // Success modal handlers
    const handleSuccessModalClose = () => {
      showSuccessModal.value = false
      router.push('/')
    }

    const handleIssueAnother = () => {
      showSuccessModal.value = false
      router.push('/scan')
    }

    // Interest handlers
    const handleInterestSuccess = () => {
      showAddInterest.value = false
      selectedAction.value = ''
      router.push('/')
    }

    const handleInterestClose = () => {
      showAddInterest.value = false
      selectedAction.value = ''
    }

    // Handle back button navigation
    const handleBackButton = () => {
      if (isFromInterest.value) {
        // If we came from interest, go back to the gift details page
        const giftId = route.params.id
        router.push(`/gifts/${giftId}`)
      } else {
        // Normal flow - go back to scan page
        router.push('/scan')
      }
    }

    // Utility functions
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'

      try {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-GB', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
      } catch (err) {
        return dateString
      }
    }

    // Check for pre-selected recipient from route query parameters
    const checkForPreselectRecipient = async () => {
      const query = route.query
      
      if (query.preselect_recipient === 'true') {
        // Mark that we came from interest
        isFromInterest.value = true
        
        // Auto-select the dispatch action when coming from interests
        selectedAction.value = 'dispatch'
        
        // Try to find the recipient in existing recipients first
        const mobileNumber = query.mobile_number || ''
        const ownerName = query.owner_full_name || ''
        
        console.log('Searching for existing recipient:', { mobileNumber, ownerName })
        
        if (mobileNumber || ownerName) {
          try {
            // Search for existing recipient using mobile number or name
            const searchTerm = mobileNumber || ownerName
            const response = await fetch('/api/method/gift.api_v2.search_recipients', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Frappe-CSRF-Token': window.csrf_token || ''
              },
              body: JSON.stringify({
                search_term: searchTerm,
                limit: 20
              })
            })

            const result = await response.json()
            let foundRecipient = null

            if (result.message && result.message.success && result.message.data) {
              console.log('Search results:', result.message.data)
              
              // Normalize mobile numbers for comparison (remove spaces, dashes, etc.)
              const normalizeMobile = (mobile) => mobile ? mobile.replace(/[\s\-\+\(\)]/g, '') : ''
              const normalizedSearchMobile = normalizeMobile(mobileNumber)
              
              // Look for exact match based on mobile number (most reliable)
              if (normalizedSearchMobile) {
                foundRecipient = result.message.data.find(recipient => {
                  const recipientMobile = normalizeMobile(recipient.coordinator_mobile_no || '')
                  return recipientMobile === normalizedSearchMobile
                })
                
                console.log('Mobile number search result:', foundRecipient)
              }
              
              // If not found by mobile, try to match by owner name (exact match)
              if (!foundRecipient && ownerName) {
                foundRecipient = result.message.data.find(recipient => 
                  recipient.owner_full_name?.toLowerCase().trim() === ownerName.toLowerCase().trim()
                )
                
                console.log('Owner name search result:', foundRecipient)
              }
              
              // If still not found and we have mobile number, try partial match
              if (!foundRecipient && normalizedSearchMobile) {
                foundRecipient = result.message.data.find(recipient => {
                  const recipientMobile = normalizeMobile(recipient.coordinator_mobile_no || '')
                  return recipientMobile.includes(normalizedSearchMobile) || normalizedSearchMobile.includes(recipientMobile)
                })
                
                console.log('Partial mobile search result:', foundRecipient)
              }
            }

            if (foundRecipient) {
              // Found existing recipient - select them
              recipientMode.value = 'existing'
              selectedRecipient.value = foundRecipient
              recipientSearch.value = `${foundRecipient.owner_full_name} - ${foundRecipient.coordinator_full_name}`

              // Populate form with existing recipient data
              form.owner_full_name = foundRecipient.owner_full_name
              form.coordinator_full_name = foundRecipient.coordinator_full_name
              form.mobile_number = foundRecipient.coordinator_mobile_no
              form.emirates_id = foundRecipient.coordinator_emirates_id || ''
              form.address = foundRecipient.address || ''

              showNotification(`Existing recipient ${foundRecipient.owner_full_name} has been auto-selected`, 'success')
              console.log('Selected existing recipient:', foundRecipient)
            } else {
              // Recipient not found - create as new
              console.log('Recipient not found in existing records, creating as new')
              createNewRecipientFromInterest(query)
            }

          } catch (error) {
            console.error('Error searching for existing recipient:', error)
            // Fallback to creating new recipient
            createNewRecipientFromInterest(query)
          }
        } else {
          // No search criteria - create as new
          console.log('No search criteria provided, creating as new recipient')
          createNewRecipientFromInterest(query)
        }

        // Clear any errors
        delete errors.value.selectedRecipient
        delete errors.value.newRecipient
      }
    }

    // Helper function to create new recipient from interest data
    const createNewRecipientFromInterest = (query) => {
      // Set the recipient mode to 'new' since we're creating a recipient from interest data
      recipientMode.value = 'new'
      
      // Create a recipient object from query parameters
      const preselectedRecipient = {
        owner_full_name: query.owner_full_name || '',
        coordinator_full_name: query.coordinator_full_name || '',
        coordinator_mobile_no: query.mobile_number || '',
        coordinator_emirates_id: query.emirates_id || '',
        address: query.address || ''
      }

      // Set as newly created recipient to show in the form
      newlyCreatedRecipient.value = preselectedRecipient

      // Populate form with recipient data
      form.owner_full_name = preselectedRecipient.owner_full_name
      form.coordinator_full_name = preselectedRecipient.coordinator_full_name
      form.mobile_number = preselectedRecipient.coordinator_mobile_no
      form.emirates_id = preselectedRecipient.coordinator_emirates_id
      form.address = preselectedRecipient.address

      // Show notification that recipient was pre-selected as new
      if (preselectedRecipient.owner_full_name) {
        showNotification(`New recipient ${preselectedRecipient.owner_full_name} has been pre-filled from interests`, 'info')
      }
    }

    // Lifecycle
    onMounted(async () => {
      loadGiftDetails()

      // Check for pre-selected recipient from query parameters
      await checkForPreselectRecipient()

      // Close recipient dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.recipient-search-container')) {
          showRecipientDropdown.value = false
        }
      })
    })

    return {
      // Stores
      authStore,
      // State
      loading,
      submitting,
      error,
      gift,
      form,
      errors,
      route,
      showCamera,
      showEmiratesIdScanner,
      showAdditionalDetails,
      showSuccessModal,
      showAddInterest,
      selectedAction,
      isFromInterest,
      capturedPhoto,
      galleryInput,
      // Recipient search and management
      recipientSearch,
      searchResults,
      showRecipientDropdown,
      selectedRecipient,
      recipientMode,
      showCreateRecipientModal,
      newlyCreatedRecipient,
      searchRecipients,
      selectRecipient,
      clearSelectedRecipient,
      editNewRecipient,
      handleRecipientCreated,
      clearNewRecipient,
      // Existing methods
      selectAction,
      autoSelectActionIfNeeded,
      loadGiftDetails,
      openCamera,
      openGallery,
      handleGalleryPhoto,
      handleCapturedPhoto,
      clearPhoto,
      handleEmiratesIdData,
      addDocument,
      removeDocument,
      handleDocumentUpload,
      viewDocument,
      submitGiftIssue,
      handleSuccessModalClose,
      handleIssueAnother,
      handleInterestSuccess,
      handleInterestClose,
      handleBackButton,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Form styling */
input:focus,
select:focus,
textarea:focus {
  outline: none !important;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transitions */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Disabled state */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Photo preview styling */
.aspect-square {
  aspect-ratio: 1 / 1;
}

/* Accessibility */
/* PWA and Touch Optimizations */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Ensure buttons are touch-friendly on all devices */
button {
  min-height: 44px;
  /* iOS accessibility guidelines */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Action buttons specific styling */
button[class*="border-charcoal-200"] {
  -webkit-appearance: none;
  appearance: none;
  user-select: none;
  -webkit-user-select: none;
}

/* Mobile viewport fixes */
@media (max-width: 768px) {
  .min-h-screen {
    min-height: 100vh;
    min-height: 100dvh;
    /* Dynamic viewport height */
  }

  /* Ensure bottom padding accounts for mobile browsers */
  .pb-24 {
    padding-bottom: 8rem;
    /* Increased from default */
  }

  /* Make buttons more touch-friendly */
  button {
    min-height: 44px;
    /* iOS accessibility guidelines */
    touch-action: manipulation;
  }

  /* Prevent zoom on input focus */
  input,
  select,
  textarea {
    font-size: 16px;
  }

  /* Action buttons responsive layout */
  .flex.flex-col.sm\\:flex-row {
    gap: 0.75rem;
  }

  .flex.flex-col.sm\\:flex-row button {
    width: 100%;
    justify-content: center;
  }
}

/* iOS safe area handling */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: calc(6rem + env(safe-area-inset-bottom));
  }
}

@media (prefers-reduced-motion: reduce) {
  .animate-spin {
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

  input,
  select,
  textarea {
    border-width: 2px;
  }
}
</style>

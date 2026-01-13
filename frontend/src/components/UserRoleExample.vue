<!-- Example of how to use the User Role system in any Vue component -->
<template>
  <div class="user-role-example">
    <!-- Display current user role -->
    <div v-if="authStore.hasRole" class="role-display">
      <p>Current User Role: <strong>{{ authStore.userRole }}</strong></p>
    </div>

    <!-- Admin-only content -->
    <div v-if="authStore.isAdmin" class="admin-content">
      <h3>Admin Controls</h3>
      <button @click="adminAction">Admin Action</button>
      <p>This content is only visible to Admins</p>
    </div>

    <!-- Event Manager content -->
    <div v-if="authStore.isEventManager || authStore.isAdmin" class="manager-content">
      <h3>Event Manager Controls</h3>
      <button @click="managerAction">Manager Action</button>
      <p>This content is visible to Event Managers and Admins</p>
    </div>

    <!-- Event Coordinator content -->
    <div v-if="authStore.isEventCoordinator || authStore.isEventManager || authStore.isAdmin" class="coordinator-content">
      <h3>Event Coordinator Controls</h3>
      <button @click="coordinatorAction">Coordinator Action</button>
      <p>This content is visible to Event Coordinators, Event Managers, and Admins</p>
    </div>

    <!-- Content for users without a role -->
    <div v-if="!authStore.hasRole" class="no-role-content">
      <p>Please contact your administrator to assign a role to your account.</p>
    </div>

    <!-- Example of using computed properties for complex role logic -->
    <div v-if="canManageUsers" class="user-management">
      <h3>User Management</h3>
      <p>You have permission to manage users</p>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'UserRoleExample',
  setup() {
    const authStore = useAuthStore()

    // Computed property for complex role-based logic
    const canManageUsers = computed(() => {
      return authStore.isAdmin || authStore.isEventManager
    })

    // Example methods that can be restricted by role
    const adminAction = () => {
      if (!authStore.isAdmin) {
        alert('Access denied: Admin role required')
        return
      }
      console.log('Performing admin action...')
      // Admin-specific logic here
    }

    const managerAction = () => {
      if (!authStore.isAdmin && !authStore.isEventManager) {
        alert('Access denied: Event Manager or Admin role required')
        return
      }
      console.log('Performing manager action...')
      // Manager-specific logic here
    }

    const coordinatorAction = () => {
      if (!authStore.isAdmin && !authStore.isEventManager && !authStore.isEventCoordinator) {
        alert('Access denied: Event Coordinator, Event Manager, or Admin role required')
        return
      }
      console.log('Performing coordinator action...')
      // Coordinator-specific logic here
    }

    // Load user role on component mount
    onMounted(async () => {
      if (authStore.isAuthenticated && !authStore.userRole) {
        await authStore.loadUserRole()
      }
    })

    return {
      authStore,
      canManageUsers,
      adminAction,
      managerAction,
      coordinatorAction
    }
  }
}
</script>

<style scoped>
.user-role-example {
  padding: 20px;
}

.role-display {
  background-color: #f0f9ff;
  border: 1px solid #0284c7;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
}

.admin-content {
  background-color: #fef2f2;
  border: 1px solid #dc2626;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.manager-content {
  background-color: #f0f9ff;
  border: 1px solid #2563eb;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.coordinator-content {
  background-color: #f0fdf4;
  border: 1px solid #16a34a;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.no-role-content {
  background-color: #fffbeb;
  border: 1px solid #d97706;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.user-management {
  background-color: #f8fafc;
  border: 1px solid #64748b;
  border-radius: 8px;
  padding: 15px;
}

button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
}

button:hover {
  background-color: #2563eb;
}
</style>

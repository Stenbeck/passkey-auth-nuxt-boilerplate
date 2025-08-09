<template>
	<div>
		<h1>User Settings</h1>
		<AuthAddNewPasskey />
		<AuthManagePasskeys />
	</div>
</template>

<script setup>
definePageMeta({
	middleware: 'auth',
})
</script>

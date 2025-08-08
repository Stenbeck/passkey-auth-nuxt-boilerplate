<template>
	<div>
		<h1>User Settings</h1>
		<AuthAddNewPasskey />
	</div>
</template>

<script setup>
definePageMeta({
	middleware: 'auth',
})
</script>

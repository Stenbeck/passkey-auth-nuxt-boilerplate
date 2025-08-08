<template>
	<AppWelcome />
</template>

<script setup>
definePageMeta({
	middleware: 'auth',
})
</script>

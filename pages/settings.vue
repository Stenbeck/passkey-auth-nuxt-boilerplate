<template>
	<div>
		<AuthManagePasskeys />
	</div>
</template>

<script setup>
definePageMeta({
	middleware: 'auth',
})
</script>

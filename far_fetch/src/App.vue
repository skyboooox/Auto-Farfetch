<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>

    <nav>
      <RouterLink to="/">WATCH</RouterLink>
      <RouterLink to="/settings">SETTINGS</RouterLink>
      <RouterLink to="/newprod">NEW</RouterLink>
    </nav>

  </header>

  <RouterView />
</template>

<style scoped>
header {
  >nav {
    display: flex;
    color: #fff;
    justify-content: space-evenly;
    background-color: #666666;
    align-items: center;
    height: 3rem;
    box-shadow: 0px 0px 7px 4px #000000;
    margin-bottom: 2rem;
  }

  >nav>a {
    font-size: 1.5rem;
  }

  >nav>a:visited {
    color: rgb(255, 255, 255);
  }
}
</style>

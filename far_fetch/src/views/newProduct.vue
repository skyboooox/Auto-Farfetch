
<script setup>
import product_list from '../components/product_list.vue'

</script>

<template>
  <main v-if="ready" >
    <div class="product_list">
    <product_list v-for="(item, index) in newProducts" :key="index" :sku="item" />
    <div>只储存最近的100条</div>
  </div>
  
  </main>
</template>
<script>
export default {
  data() {
    return {
      ready: false,
      newProducts:[],
    }
  },
  watch: {
    selected: function (val) {
      console.log(val)
      this.products.forEach((e, i) => {
        if (e.keyword == val) {
          this.product = e.data;
        }
      });
    }
  },
  computed: {

  },

  methods: {

    getNew() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };

      fetch(`./new`, requestOptions)
        .then(response => response.text())
        .then(result => {
          this.newProducts = JSON.parse(result);
  
          this.newProducts.reverse();

          if (!this.ready) {
            this.ready = true;
          }
        })
        .catch(error => console.log('error', error));
    },



  },
  created() {
    this.getNew();



  },
  mounted() {
    setInterval(() => {
      if (this.ready) {
        this.getNew()
      }
    }, 1000);

  },
  updated() {

  }
}
</script>




<style scoped>

.product_list {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

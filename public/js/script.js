// Vue instance
new Vue({
    el: "#main",
    data: {
        images: [],
    },
    mounted: function () {
        axios.get("/images").then((response) => {
            this.images = response.data;
        });
    },
});

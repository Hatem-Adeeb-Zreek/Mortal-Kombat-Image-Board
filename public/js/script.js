// Vue instance
new Vue({
    el: "#main",
    data: {
        images: [],
        title: "",
        description: "",
        username: "",
        file: null,
    },
    mounted: function () {
        axios
            .get("/images")
            .then((response) => {
                this.images = response.data;
            })
            .catch(function (err) {
                console.log("error in axios GET /images", err);
            });
    },
    methods: {
        handleClick: function (e) {
            e.preventDefault();
            var formData = new FormData(); //we need this to send a *file*
            formData.append("title", this.title);
            formData.append("description", this.description);
            formData.append("username", this.username);
            formData.append("file", this.file);

            axios
                .post("/upload", formData)
                .then((response) => {
                    this.images.unshift(response.data.rows[0]);
                })
                .catch((err) => {
                    console.log("error in axios POST /upload", err);
                });
        },
        handleChange: function (e) {
            this.file = e.target.files[0]; //grabbing the file from the choose file button
        },
    },
});

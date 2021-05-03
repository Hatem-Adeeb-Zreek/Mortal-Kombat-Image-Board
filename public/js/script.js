// Vue components

// modal-component
Vue.component("modal-component", {
    template: "#modal-template",
    props: ["selectedImage"],
    data: function () {
        return {
            imgDetails: "",
            imgComments: [],
            created_at: "",
            // cmtText: "",
            // cmtUser: "",
        };
    },
    mounted: function () {
        let urlAxiosAll = `/getall/${this.selectedImage}`;
        axios
            .get(urlAxiosAll)
            .then((response) => {
                this.imgDetails = response.data[0];
                this.created_at = new Date(response.data[0].created_at)
                    .toUTCString()
                    .replace("GMT", "");
                for (let i = 0; i < response.data.length; i++) {
                    this.imgComments.push(response.data[i]);
                }
            })
            .catch(function (err) {
                console.log("error in axios GET /comments/:imageId", err);
            });
    },
    methods: {
        // submitComment: function (e) {
        //     e.preventDefault();
        //     let commentObj = {
        //         comment: this.cmtText,
        //         username: this.cmtUser,
        //         imageId: this.selectedImage,
        //     };
        //     axios
        //         .post("/addcomment", commentObj)
        //         .then(function (response) {
        //             this.imgComments.unshift(response.data.rows[0]);
        //         })
        //         .catch(function (err) {
        //             console.log("error in axios POST /addcomment", err);
        //         });
        // },
        closeModal: function () {
            this.$emit("close");
        },
    },
});

// Vue instance
new Vue({
    el: "#main",
    data: {
        images: [],
        title: "",
        description: "",
        username: "",
        file: null,
        selectedImage: null,
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
        submitImage: function (e) {
            e.preventDefault();
            var formData = new FormData();
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
            this.file = e.target.files[0];
        },
        imageClick: function (e) {
            this.selectedImage = e;
        },
        closeModalFn: function () {
            this.selectedImage = null;
        },
    },
});

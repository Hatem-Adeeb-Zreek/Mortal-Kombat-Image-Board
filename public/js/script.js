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
            cmtText: "",
            cmtUser: "",
            errmsg: false,
        };
    },
    mounted: function () {
        axios
            .get(`/getall/${this.selectedImage}`)
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
                console.log("error in axios GET /comments/:imageid", err);
            });
    },
    methods: {
        submitComment: function (e) {
            e.preventDefault();
            let commentObj = {
                comment: this.cmtText,
                username: this.cmtUser,
                imageid: this.selectedImage,
            };
            axios
                .post("/addcomment", commentObj)
                .then((response) => {
                    if (response.data.success) {
                        this.imgComments.unshift(response.data.rows[0]);
                        this.errmsg = false;
                        this.cmtText = "";
                        this.cmtUser = "";
                    } else {
                        this.errmsg = true;
                    }
                })
                .catch(function (err) {
                    console.log("error in axios POST /addcomment", err);
                });
        },
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
        errmsg: false,
        selectedImage: null,
        more: true,
    },
    mounted: function () {
        axios
            .get("/images")
            .then((response) => {
                this.images = response.data.rows;
                if (
                    response.data.rows[response.data.rows.length - 1].id ===
                    response.data.lowestId
                ) {
                    this.more = false;
                }
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
                    if (response.data.success) {
                        this.images.unshift(response.data.rows[0]);
                        this.errmsg = false;
                        this.file = null;
                        this.title = "";
                        this.description = "";
                        this.username = "";
                    } else {
                        this.errmsg = true;
                    }
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
        getMore: function () {
            let lastid = this.images[this.images.length - 1].id;
            axios
                .get(`/moreimages/${lastid}`)
                .then((response) => {
                    for (let i = 0; i < response.data.length; i++) {
                        this.images.push(response.data[i]);
                    }
                    if (
                        response.data[response.data.length - 1].id ===
                        response.data[0].lowestid
                    ) {
                        this.more = false;
                    }
                })
                .catch(function (err) {
                    console.log("error in axios GET /moreimages", err);
                });
        },
    },
});

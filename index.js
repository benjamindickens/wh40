const initSelect = (form) => {
    var x, i, j, l, ll, selElmnt, a, b, c;
    /* Look for any elements with the class "custom-select": */
    x = document.getElementsByClassName("custom-select");
    l = x.length;
    for (i = 0; i < l; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;
        /* For each element, create a new DIV that will act as the selected item: */
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        /* For each element, create a new DIV that will contain the option list: */
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 0; j < ll; j++) {
            /* For each option in the original select element,
            create a new DIV that will act as an option item: */
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.setAttribute('value', selElmnt.options[j].value);
            c.addEventListener("click", function (e) {
                /* When an item is clicked, update the original select box,
                and the selected item: */
                var y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) {
                    if (s.options[i].innerHTML == this.innerHTML) {
                        s.selectedIndex = i;
                        h.innerHTML = this.innerHTML;
                        const selected = this.getAttribute("value");

                        if (selected === "others") {
                            form.popup.classList.add("_show", "_effect");
                        } else {
                            form.form.querySelector(".js-calc[name='effect']").innerText = selected;
                        }


                        y = this.parentNode.getElementsByClassName("same-as-selected");
                        yl = y.length;
                        for (k = 0; k < yl; k++) {
                            y[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                h.click();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener("click", function (e) {
            /* When the select box is clicked, close any other select boxes,
            and open/close the current select box: */
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    }

    function closeAllSelect(elmnt) {
        /* A function that will close all select boxes in the document,
        except the current select box: */
        var x, y, i, xl, yl, arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        xl = x.length;
        yl = y.length;
        for (i = 0; i < yl; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i)
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (i = 0; i < xl; i++) {
            if (arrNo.indexOf(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }

    /* If the user clicks anywhere outside the select box,
    then close all select boxes: */
    document.addEventListener("click", closeAllSelect);
}


class formMechanics {

    constructor(form, popup) {

        this.form = typeof form === "string" ? document.querySelector(form) : form;
        this.popup = typeof popup === "string" ? document.querySelector(popup) : popup;

        this.getInputsValue = (inputs) => {
            const result = {}
            inputs.forEach(input => {
                const name = input.getAttribute("name");
                result[name] = input.value ? input.value : input.innerText;
            });
            return result;
        }


        this.setUpErrorField = (form, field, text = null) => {
            if (text) {
                form.querySelector(`[name='${field}']`).nextElementSibling.innerText = text;

            }
            form.querySelector(`[name='${field}']`).parentElement.classList.add("_error");
        }

        this.validateData = (data, fields, form) => {
            let isValidData = true;
            fields.forEach(field => {
                if (field === "effect") {
                    const value = +data[field].replace(/\s/g, '');
                    if (typeof value !== "number" || Number.isNaN(value)) {
                        this.setUpErrorField(form, field)
                        isValidData = false;
                    }
                }
                if (data[field] === "") {
                    this.setUpErrorField(form, field)
                    isValidData = false;
                }
            })

            return isValidData;
        }

        this.getRequiredFields = (form) => {
            return [...form.querySelectorAll("[data-required]")].map(field => field.name);
        }

        this.resetInputs = (inputs) => {
            inputs.forEach(input => {
                input.value = ""
                input.parentElement.classList.remove("_error")
            });
        }

        this.resetError = (input) => {
            input.onfocus = () => input.parentElement.classList.remove("_error")
        }

        this.submitForm = (e, form, calcInputs) => {
            if (e.target.classList.contains("js-submit") && !e.target.classList.contains("_pressed")) {
                e.target.classList.add("_pressed");
                setTimeout(() => e.target.classList.remove("_pressed"), 20)
                const data = this.getInputsValue(calcInputs);
                const requiredField = this.getRequiredFields(form);
                const isValid = this.validateData(data, requiredField, form)
                return (isValid) ? data : false;
            }
        }
    }
}

class formCalc extends formMechanics {
    constructor(form, popup) {
        super(form, popup);
        this.init = (form) => {
            const errorsInputs = form.querySelectorAll(".js-input"),
                calcInputs = form.querySelectorAll(".js-calc"),
                rateType = this.popup.querySelector(".js-rate-type"),
                rateValue = this.popup.querySelector(".js-rate-value"),
                select = form.querySelector(".js-select"),
                reset = this.popup.querySelector(".js-reset");
            errorsInputs.forEach(input => this.resetError(input));
            form.onsubmit = (e) => e.preventDefault();

            form.onclick = async (e) => {
                const data = await this.submitForm(e, form, calcInputs);
                if (data) {
                    const {roll, skill, effect} = data;
                    const skillAfterEffect = +skill + (+effect);
                    let result = ((skillAfterEffect - roll) / 10);
                    rateType.innerText = result < 0 ? "ПРОВАЛА" : "УСПЕХА";
                    const absResult = Math.abs(result);
                    rateValue.innerHTML = absResult < 1 ? 1 : Math.floor(absResult);
                    this.popup.classList.add("_show", "_result");
                }
            }

            reset.onclick = (e) => {
                this.resetInputs(calcInputs);
                this.popup.classList.remove("_show", "_result");
                select.selectedIndex = 0;
            }
        }
        this.init(this.form)
    }
}


class formEffect extends formMechanics {
    constructor(form, popup) {
        super(form, popup);
        this.init = (form) => {
            const errorsInputs = form.querySelectorAll(".js-input"),
                calcInputs = form.querySelectorAll(".js-calc");
            errorsInputs.forEach(input => this.resetError(input));
            form.onsubmit = (e) => e.preventDefault();

            form.addEventListener("click", (e) => {
                const data = this.submitForm(e, form, calcInputs);
                if (data) {
                    document.querySelector(".js-effect-value").innerText = data.effect >= 0 ? `+${data.effect}` : data.effect;
                    this.popup.classList.remove("_show", "_effect");
                    this.resetInputs(calcInputs);
                }
            })
        }
        this.init(this.form)
    }
}

window.onload = () => {
    document.body.classList.add("_loaded");
    const current = JSON.parse(window.localStorage.getItem("theme"));
    const themes = document.querySelector(".js-themes");
    const root = document.querySelector(':root');
    const themesList = {
        white: {
            '--main-color': "white",
            '--second-color': "black",
            '--third-color': "rgba(0, 0, 0, .1)",
        },
        black: {
            '--main-color': "rgba(0, 0, 0, .9)",
            '--second-color': "white",
            '--third-color': "rgba(255, 255, 255, .1)",
        },
    }

    const setThemeProperty = (key, value) => {
        root.style.setProperty(key, value);
    }

    const setTheme = (name) => {
        for (const key in themesList[name]) {
            setThemeProperty(key, themesList[name][key])
        }
    }

    themes.onclick = (e) => {
        const nextTheme = e.target?.dataset.theme;
        if (nextTheme) {
            setTheme(nextTheme)
            window.localStorage.setItem("theme", JSON.stringify(nextTheme));
        }
    }

    if (!current || !themesList[current]) {
        setTheme("white");
    } else {
        setTheme(current);
    }

}

const mainForm = new formCalc(".js-calc-form", "[data-popup]");
new formEffect(".js-effect-form", "[data-popup]");
initSelect(mainForm)
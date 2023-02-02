/*
document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    alert(document.querySelector('.name').value + document.querySelector('.pass').value)
})
*/

document.querySelectorAll('.item').forEach((i) => {
    i.addEventListener('click', function (e) {
        console.log(e.target.parentElement.dataset.id)
        const userId = e.target.parentElement.dataset.id; 

    })
})
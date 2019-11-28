$(document).ready(function(){
    if (typeof web3 !== 'undefined') 
    {
        web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
    } 
    else 
    {
        web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(web3Provider);
    }
    Battleship = null;
    $.ajax({
        type:"GET",
        url:"/contract",
        success: function(response){
            Battleship = TruffleContract(response.contract);
            Battleship.setProvider(web3Provider);
        },
        error: function(response) {
        window.location.href='/login';
        }
    });
});
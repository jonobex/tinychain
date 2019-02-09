$(() => {

    /**
     * "Toast" function for displaying messages to the user.
     */
    $('#toast').hide();
    function toast(message) {
        var toast = $('#toast');
        toast.html('<span class="icon-alert inverse"></span> ' + message);
        toast.show();
        setTimeout(() => {
            toast.fadeOut(500);
        }, 5000);
    }

    /**
     * Sign and send a transaction. Two separete HTTP calls are implied.
     */
    $("#send").on('click', () => {
        var transaction_data = {
            source: $('#wallet-id').val(),
            destination: $('#destination').val(),
            amount: $('#amount').val(),
            key: $('#wallet-secret').val()
        };
        $.post('wallet/sign', transaction_data)
            .done(data => {
                console.log(data);
                toast("Transaction signed.");
                $.post('transaction', { data: data })
                    .done(data => {
                        console.log(data);
                        toast("Transaction submitted.");
                    })
                    .fail(error => {
                        toast("Failed to submit transaction");
                        console.error(error.responseText);
                    });
            });
    });

    /**
     * Ask the server to mine a block.
     */
    var mining = $('#mining-in-progress'),
        mine_button = $('#mine');
    mining.hide();
    mine_button.on('click', () => {
        mine_button.hide();
        mining.show();
        var mining_request = {
            url: 'chain/mine',
            type: 'PUT',
            data: { address: $("#wallet-id").val() }
        };

        $.ajax(mining_request)
            .done(response => {
                let s = $("#mine_ok");
                s.show();
                s.fadeOut(3000);

                mine_button.show();
                mining.hide();
                load_data();
            }).fail(error => {
                let s = $("#mine_fail");
                s.show();
                s.fadeOut(2000);

                mine_button.show();
                mining.hide();
            });
    });

    /**
     * Request a new wallet
     */
    $('#new-wallet').on('click', () => {
        $.getJSON('wallet/new', data => {
            $("#wallet-id").val(data.address);
            $("#wallet-secret").val(data.secret);
        });
    });
});
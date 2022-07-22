'use strict';


// Get Parametersを取得するやつ
function getQueryParams() {
    if (1 < document.location.search.length) {
        const query = document.location.search.substring(1);
        const params = query.split('&');

        const result = {};
        for(var param of params) {
            const element = param.split('=');
            const key = decodeURIComponent(element[0]);
            const value = decodeURIComponent(element[1]);
            result[key] = value;
        }
        return result;
    }
    return null;
}

window.onload = ()=> {
    const query = getQueryParams();
    // api keyはGet Parameterから取る
    // これは演習で簡単に設定するための雑な処理で推奨ではない
    const key = query["key"];
    //peer idもGet Parameterから取る
    const peer_id = query["peer_id"]
    const peer = new Peer(peer_id, {
        key: key,
        debug: 3
    });

    peer.on('open', function (a) {
        console.log(a);
        // SkyWay Serverに自分のapi keyで繋いでいるユーザ一覧を取得
        let peers = peer.listAllPeers(peers => {
            //JavaScript側で入れたやつとRuby側で入れたやつが出てくればよい
            console.log(peers);
        });
    });

    peer.on('error', function (err) {
        alert(err.message);
    });
    
    const messages = document.getElementById('js-messages');
    // var element = document.getElementById("aaa");
    // var str = "";
    
    document.getElementById("call_button").onclick = ()=>{
        const target_id = document.getElementById("target_id_box").value;
        const call = peer.call(target_id, null, {
            videoReceiveEnabled: true
        });

        call.on('stream', (stream) => {
            document.getElementById("remote_video").srcObject = stream;
        });

        const connection = peer.connect(target_id, {
            serialization: "none"
        });
        connection.once('open', async () => {
            messages.textContent = `=== DataConnection has been opened 1 !===\n`;

        });
        connection.on('data', (data)=> {
            console.log(data);
            console.log(String.fromCharCode.apply("", new Uint8Array(data)));
            messages.textContent += String.fromCharCode.apply("", new Uint8Array(data));
            messages.textContent += ' \n';
        });
        if(!(window.Gamepad)) return;
        if(!(navigator.getGamepads)) return;
		var ans = Array(21);
        ans.fill(0);
		setInterval(function(){
			var str = "";
			var gamepad_list = navigator.getGamepads();
			var num = gamepad_list.length;
			var i=0;
			for(i=0;i < num;i++){
				var gamepad = gamepad_list[i];
				if(!gamepad) continue;
				var buttons = gamepad.buttons;
				var j;
				var n = buttons.length;
                console.log(n);
				for(j=0;j < n;j++){
					var button = buttons[j];
					// str += "  \"" + j + "\": ";
					str =  button.value;// + " \n";
					if (parseInt(str, 10) == 1){
						ans[j] = 1;
					}else{
						ans[j] = 0;
					}
				}
				var axes = gamepad.axes;
				// // str += "axes: {\n";
				 
				var m = axes.length;
                console.log(m);
				for(j = 0; j < m; j++){
                    var ax = axes[j];

					if (parseFloat(ax) > 0.1){
						ans[n+j] = 2;
					}else if(parseFloat(ax) < -0.1){
						ans[n+j] = 0;
					}else{
                        ans[n+j] = 1;
                    }
                }

			}
			// console.log("---");
			// element.textContent = str;
		},1000/60);
        document.getElementById("chat_button").onclick = ()=> {
            setInterval(function(){
                var pad_str = "";
                var k;
                for(k=0;k < 21;k++){
                    pad_str += String(ans[k]);
                }
                connection.send(pad_str);
            },1000/60);
        };
    };
};


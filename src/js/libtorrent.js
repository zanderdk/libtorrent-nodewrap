var ffi = require('ffi');
var ref = require('ref');
var path = require('path');

module.exports = function() {

  // get root dir
  var root_dir = __dirname.replace('/src/js', '/');

  // Load boost library and libtorrent library
  if (ffi.LIB_EXT == '.so') {
    var boostSystem = ffi.DynamicLibrary(root_dir + 'lib/ubuntu/libboost_system' + ffi.LIB_EXT + '.1.54.0');
    var boostThread = ffi.DynamicLibrary(root_dir + '/lib/ubuntu/libboost_thread' + ffi.LIB_EXT + '.1.54.0');
    var libtorrentRasterbar = ffi.DynamicLibrary(root_dir + '/lib/ubuntu/libtorrent-rasterbar' + ffi.LIB_EXT + '.8');
  } else if(ffi.LIB_EXT == '.dylib') {
    var boostSystem = ffi.DynamicLibrary(root_dir + '/lib/mac/libboost_system' + ffi.LIB_EXT);
    var boostThread = ffi.DynamicLibrary(root_dir + '/lib/mac/libboost_thread' + ffi.LIB_EXT);
    var libtorrentRasterbar = ffi.DynamicLibrary(root_dir + '/lib/mac/libtorrent-rasterbar.8' + ffi.LIB_EXT);
  }

  var s = ffi.Library(path.resolve(root_dir, 'src/cpp/session'), {
    'get_session_ptr': [ 'pointer', [] ],
    'get_torrent_ptr': [ 'pointer', [] ],
    'get_torrent_index': [ 'pointer', [] ],
    'listen_on': [ 'int', ['pointer', 'int', 'int'] ],
    'add_torrent': [ 'pointer', ['pointer', 'pointer', 'CString', 'CString', 'CString', 'CString'] ],
    'create_magnet_uri': [ ref.refType('CString'), ['pointer'] ],
    'start_dht': [ 'int', ['pointer'] ],
    'add_port_forwarding': [ 'int', ['pointer', 'int', 'int'] ],
    'find_torrent': [ 'pointer', ['pointer', 'pointer'] ],
    'remove_torrent': [ 'int', ['pointer', 'pointer'] ],
    'get_downloading_progress': [ 'double', ['pointer'] ],
    'get_torrent_state': [ 'int', ['pointer'] ],
    'get_info_hash': [ 'CString', ['pointer'] ],
    'find_torrent_info_hash': [ 'pointer', ['pointer', 'CString'] ],
    'add_torrent_by_maget_uri': [ 'pointer', ['pointer', 'CString', 'CString'] ],
  });

  var Session = function() {
    var _s = s.get_session_ptr();
    var _torrent_infos = [];

    this.listen_on = function(fromPort, toPort, callback) {
      var port = s.listen_on(_s, fromPort, toPort);
      callback(port);
    };

    this.add_torrent = function(infile, outpath, creator, comments) {
      var ti = s.get_torrent_ptr();

      // call add torrent info
      var th_ptr = s.add_torrent(_s, ti, infile, outpath, creator, comments);

      // add torrent info into torrent_infos list
      _torrent_infos.push(ti);

      return th_ptr;
    };

    this.add_torrent_by_maget_uri = function(savepath, magnet_uri) {

      // call add torrent info
      var th_ptr = s.add_torrent_by_maget_uri(_s, savepath, magnet_uri);

      return th_ptr;
    };

    this.start_dht = function() {
      s.start_dht(_s);
    };

    this.add_port_forwarding = function(fromPort, toPort) {
      s.add_port_forwarding(_s, fromPort, toPort);
    };

    this.get_torrent_infos = function() {
      return _torrent_infos;
    };

    this.find_torrent = function(t_handle_ptr) {
      var torrent_handle = s.find_torrent(_s, t_handle_ptr);
      return torrent_handle;
    };

    this.remove_torrent = function(t_handle_ptr) {
      return s.remove_torrent(_s, t_handle_ptr);
    };

    this.get_downloading_progress = function(t_handle_ptr) {
      return s.get_downloading_progress(t_handle_ptr);
    };

    this.get_torrent_state = function(t_handle_ptr) {
      return s.get_torrent_state(t_handle_ptr);
    };

    this.get_info_hash = function(t_handle_ptr) {
      return s.get_info_hash(t_handle_ptr);
    };

    this.find_torrent_info_hash = function(t_index) {
       return s.find_torrent_info_hash(_s, t_index);
    };
  };

  var libtorrent = {
    Session: Session
  };

  return libtorrent;
}();
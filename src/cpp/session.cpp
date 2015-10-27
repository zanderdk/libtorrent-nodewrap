// include C
#include <stdint.h>
#include <stdio.h>
#include <boost/thread.hpp>

#include <sys/types.h>
#include <unistd.h>

// include libtorrent
#include "libtorrent/entry.hpp"
#include "libtorrent/bencode.hpp"
#include "libtorrent/torrent_info.hpp"
#include "libtorrent/file.hpp"
#include "libtorrent/storage.hpp"
#include "libtorrent/hasher.hpp"
#include "libtorrent/create_torrent.hpp"
#include "libtorrent/file.hpp"
#include "libtorrent/file_pool.hpp"
#include "libtorrent/magnet_uri.hpp"
#include "libtorrent/session.hpp"

using namespace libtorrent;
using namespace std;

extern "C" {

  enum listen_on_flags_t
  {
    listen_no_system_port,
  };

  enum options_t
  {
    delete_files,
  };

  enum session_flags_t
  {
    add_default_plugins,
    start_default_features,
  };

  enum protocol_type
  {
    udp,
    tcp,
  };

  /* START Constructor */
  session* new_session()
  {
    return new session();
  }

  // session* new_session_1(fingerprint const& print = fingerprint("LT"
  //     , LIBTORRENT_VERSION_MAJOR, LIBTORRENT_VERSION_MINOR, 0, 0)
  //     , int flags = start_default_features | add_default_plugins
  //     , boost::uint32_t alert_mask = alert::error_notification) {
  //   return new session(fingerprint, flags, alert_mask);
  // }

  // session* new_session_2(fingerprint const& print
  //     , int _min
  //     , int _max
  //     , char const* listen_interface = "0.0.0.0"
  //     , int flags = start_default_features | add_default_plugins
  //     , int alert_mask = alert::error_notification) {
  //   std::pair<int, int> listen_port_range = std::make_pair(_min, _max);
  //   return new session(fingerprint, listen_port_range, listen_interface, flags, alert_mask);
  // }

  /* END Constructor */

  int stop_session(session *s) {
    delete s;
    return 0;
  }

  int listen_on(session *ses, int _min, int _max)
  {
    libtorrent::error_code ec;
    ses->listen_on(std::make_pair(_min, _max), ec);
    return ses->listen_port();
  }

  torrent_handle* add_torrent(session *ses, add_torrent_params *p) {
    libtorrent::error_code ec;
    torrent_handle th = ses->add_torrent(*p, ec);
    if (ec) {
      std::cout << ec.message() << std::endl;
    }
    return new torrent_handle(th);
  }

  int start_dht(session *ses)
  {
    ses->start_dht();
    return 0;
  }

  int add_port_forwarding(session *ses, int _min, int _max)
  {
    ses->start_upnp();
    ses->start_natpmp();
    ses->add_port_mapping(session::udp, _min, _max);
    return 0;
  }

  torrent_handle* find_torrent(session *ses, torrent_handle *th) {
    sha1_hash info_hash = th->info_hash();
    torrent_handle th_tmp = ses->find_torrent(info_hash);
    return new torrent_handle(th_tmp);
  }

  int remove_torrent(session *ses, torrent_handle *th) {
    ses->remove_torrent(*th);
    return 0;
  }

  short listen_port(session *ses) {
    return ses->listen_port();
  }

  void add_extension(session *ses, peer_data *pd) {
    const std::string msg = "Test_extension";
    pd->set_peer_data(msg);

    set_bitmark_extension(pd);
    //add plug in
    ses->add_extension(&create_bitmark_metadata_plugin);
  }
}
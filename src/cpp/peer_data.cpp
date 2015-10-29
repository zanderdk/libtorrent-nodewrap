// include C
#include <string>
#include <stdio.h>
#include <stdlib.h>

#include <sys/types.h>
#include <unistd.h>

// include bitmark
#include "bitmark_plugin/bitmark_peer_data.hpp"

using namespace bitmark;

extern "C" {
  bitmark_peer_data* new_peer_data() {
    return new bitmark_peer_data();
  }
  void set_peer_data(bitmark_peer_data *pd, char *sk, char *pk, char *s_url) {
    std::string str_sk = sk;
    std::string str_pk = pk;
    std::string str_s_url = s_url;
    pd->set_peer_data(str_sk, str_pk, str_s_url);
  }
}